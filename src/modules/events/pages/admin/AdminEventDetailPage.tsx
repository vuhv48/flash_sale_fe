import { Alert, App, Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Tag } from 'antd'
import type { TableColumnsType } from 'antd'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { usePermission } from '@/modules/account/hooks/use-my-access'
import { adminEventApi } from '@/modules/events/api/admin-event-api'
import { EventFacts } from '@/modules/events/components/EventFacts'
import { EventStatusTag } from '@/modules/events/components/EventStatusTag'
import type { EventImageView, OrganizerEventDetail, OrganizerTicketType } from '@/modules/events/model/types'
import { PageHeader } from '@/shared/components/PageHeader'
import { formatMoney } from '@/shared/lib/format'

type ReasonMode = 'reject' | 'cancel'

export function AdminEventDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [reasonForm] = Form.useForm<{ reason: string }>()
  const [mode, setMode] = useState<ReasonMode | null>(null)
  const canReview = usePermission('REVIEW_EVENT')
  const canPause = usePermission('PAUSE_SALE')
  const canCancel = usePermission('CANCEL_EVENT')

  const detail = useQuery({
    queryKey: queryKeys.adminEvents.detail(id),
    queryFn: () => adminEventApi.detail(id),
    enabled: Boolean(id),
  })

  function remember(next: OrganizerEventDetail) {
    queryClient.setQueryData(queryKeys.adminEvents.detail(next.id), next)
    void queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    void queryClient.invalidateQueries({ queryKey: ['catalog'] })
  }

  const act = useMutation({
    mutationFn: (input: { kind: 'approve' | 'pause' | 'resume' } | { kind: ReasonMode; reason: string }) => {
      if (input.kind === 'reject' || input.kind === 'cancel') {
        return input.kind === 'reject' ? adminEventApi.reject(id, input.reason) : adminEventApi.cancel(id, input.reason)
      }
      if (input.kind === 'approve') return adminEventApi.approve(id)
      if (input.kind === 'pause') return adminEventApi.pause(id)
      return adminEventApi.resume(id)
    },
    onSuccess: (next) => {
      remember(next)
      setMode(null)
      reasonForm.resetFields()
      message.success('Đã cập nhật sự kiện')
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const ticketColumns: TableColumnsType<OrganizerTicketType> = [
    { title: 'Loại vé', dataIndex: 'name' },
    { title: 'Giá', dataIndex: 'price', render: (value: number) => formatMoney(value) },
    { title: 'Phát hành', dataIndex: 'totalQuantity' },
    { title: 'Đang giữ', dataIndex: 'heldQuantity' },
    { title: 'Đã bán', dataIndex: 'soldQuantity' },
    { title: 'Còn', dataIndex: 'available' },
  ]
  const imageColumns: TableColumnsType<EventImageView> = [
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (value: string) => (value === 'EVENT_COVER' ? <Tag color="red">Bìa</Tag> : <Tag>Ảnh phụ</Tag>),
    },
    { title: 'Tệp', dataIndex: 'fileName' },
    { title: 'Định dạng', dataIndex: 'mimeType' },
  ]

  if (detail.isError) {
    return <Alert type="error" showIcon message={errorMessage(detail.error)} />
  }
  if (!detail.data) {
    return null
  }

  const event = detail.data
  return (
    <>
      <PageHeader
        title={event.name}
        description={event.code}
        extra={
          <Space wrap>
            <EventStatusTag status={event.status} label={event.statusLabel} />
            {event.status === 'PENDING_REVIEW' && canReview.allowed ? (
              <Popconfirm title="Duyệt sự kiện này?" onConfirm={() => act.mutate({ kind: 'approve' })}>
                <Button type="primary" loading={act.isPending}>
                  Duyệt
                </Button>
              </Popconfirm>
            ) : null}
            {event.status === 'PENDING_REVIEW' && canReview.allowed ? (
              <Button onClick={() => setMode('reject')}>Từ chối</Button>
            ) : null}
            {event.status === 'ON_SALE' && canPause.allowed ? (
              <Popconfirm title="Tạm dừng đợt bán? Lần này không tính vào 3 lần của ban tổ chức." onConfirm={() => act.mutate({ kind: 'pause' })}>
                <Button>Tạm dừng</Button>
              </Popconfirm>
            ) : null}
            {event.status === 'PAUSED' && canPause.allowed ? (
              <Button onClick={() => act.mutate({ kind: 'resume' })}>Bán tiếp</Button>
            ) : null}
            {event.status !== 'COMPLETED' && event.status !== 'CANCELLED' && canCancel.allowed ? (
              <Button danger onClick={() => setMode('cancel')}>
                Hủy sự kiện
              </Button>
            ) : null}
            <Button onClick={() => navigate('/admin/events')}>Danh sách</Button>
          </Space>
        }
      />
      {event.rejectReason ? <Alert type="error" showIcon style={{ marginBottom: 16 }} message={event.rejectReason} /> : null}
      {event.cancelReason ? <Alert type="warning" showIcon style={{ marginBottom: 16 }} message={event.cancelReason} /> : null}
      <Card>
        <EventFacts event={event} showOwner />
      </Card>
      <Card title="Loại vé" style={{ marginTop: 16 }}>
        <Table rowKey="id" size="small" columns={ticketColumns} dataSource={event.ticketTypes} pagination={false} />
      </Card>
      <Card title="Ảnh" style={{ marginTop: 16 }}>
        <Table rowKey="id" size="small" columns={imageColumns} dataSource={event.images} pagination={false} />
      </Card>
      <Modal
        title={mode === 'cancel' ? 'Hủy sự kiện' : 'Từ chối sự kiện'}
        open={mode !== null}
        confirmLoading={act.isPending}
        onCancel={() => setMode(null)}
        onOk={() => reasonForm.submit()}
        okButtonProps={{ danger: mode === 'cancel' }}
        destroyOnHidden
      >
        <Form
          form={reasonForm}
          layout="vertical"
          onFinish={(values) => {
            if (mode) {
              act.mutate({ kind: mode, reason: values.reason.trim() })
            }
          }}
        >
          <Form.Item
            name="reason"
            label="Lý do"
            rules={[{ required: true, min: 10, max: 500, whitespace: true, message: 'Lý do từ 10 đến 500 ký tự' }]}
          >
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
