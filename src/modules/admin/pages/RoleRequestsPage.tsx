import { Alert, App, Button, Form, Input, Modal, Select, Space, Table, Tag, Tooltip } from 'antd'
import type { TableColumnsType } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { errorMessage } from '@/core/http/api-error'
import { adminRoleApi } from '@/modules/admin/api/admin-role-api'
import { PageHeader } from '@/shared/components/PageHeader'
import { RequestStatusTag } from '@/shared/components/RequestStatusTag'
import { ROLE_REQUEST_ACTIONS, ROLE_REQUEST_STATUS } from '@/shared/constants/identity'
import { formatDateTime } from '@/shared/lib/format'
import type { AdminRoleRequestQuery, RoleRequestAction, RoleRequestStatus, RoleRequestView } from '@/shared/types/identity'

type FilterValues = {
  status: RoleRequestStatus
  roleCode?: string
  action?: RoleRequestAction
}

const defaultQuery: AdminRoleRequestQuery = { status: 'PENDING' }

export function RoleRequestsPage() {
  const { message } = App.useApp()
  const [query, setQuery] = useState<AdminRoleRequestQuery>(defaultQuery)
  const [rejecting, setRejecting] = useState<RoleRequestView | null>(null)
  const [reasonForm] = Form.useForm<{ reason: string }>()

  const list = useQuery({
    queryKey: queryKeys.roleRequests.admin(query),
    queryFn: () => adminRoleApi.list(query),
  })

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'role-requests'] })
  }

  const approve = useMutation({
    mutationFn: adminRoleApi.approve,
    onSuccess: (result) => {
      message.success(result.message)
      refresh()
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => adminRoleApi.reject(id, reason),
    onSuccess: (result) => {
      message.success(result.message)
      setRejecting(null)
      reasonForm.resetFields()
      refresh()
    },
    onError: (error) => message.error(errorMessage(error)),
  })

  const columns: TableColumnsType<RoleRequestView> = [
    { title: 'Mã', dataIndex: 'id', width: 72 },
    { title: 'Người gửi', dataIndex: 'username' },
    { title: 'Vai trò', dataIndex: 'roleName', render: (_, row) => `${row.roleName} (${row.roleCode})` },
    {
      title: 'Loại',
      dataIndex: 'action',
      width: 110,
      render: (action: RoleRequestView['action']) =>
        action === 'ADD' ? <Tag color="blue">Xin thêm</Tag> : <Tag color="orange">Xin gỡ</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: RoleRequestView['status']) => <RequestStatusTag status={status} />,
    },
    { title: 'Ghi chú', dataIndex: 'note', ellipsis: true, render: (value: string | null) => value || '—' },
    { title: 'Gửi lúc', dataIndex: 'createdAt', width: 150, render: (value: string) => formatDateTime(value) },
    {
      title: '',
      key: 'actions',
      width: 180,
      render: (_, row) =>
        row.status === 'PENDING' ? (
          <Space>
            <Tooltip title={row.approveBlocked ? row.approveBlockReason : undefined}>
              <Button
                size="small"
                type="primary"
                disabled={row.approveBlocked}
                loading={approve.isPending && approve.variables === row.id}
                onClick={() => approve.mutate(row.id)}
              >
                Duyệt
              </Button>
            </Tooltip>
            <Button size="small" onClick={() => setRejecting(row)}>
              Từ chối
            </Button>
          </Space>
        ) : null,
    },
  ]

  return (
    <>
      <PageHeader
        title="Duyệt vai trò"
        description="Yêu cầu đang chờ được xử lý trước. Duyệt thì thêm hoặc gỡ đúng vai trò trong yêu cầu."
      />
      <Form<FilterValues>
        layout="inline"
        initialValues={defaultQuery}
        style={{ marginBottom: 16 }}
        onFinish={(values) =>
          setQuery({
            status: values.status,
            roleCode: values.roleCode?.trim() || undefined,
            action: values.action,
          })
        }
      >
        <Form.Item name="status" label="Trạng thái">
          <Select
            style={{ width: 160 }}
            options={ROLE_REQUEST_STATUS.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Form.Item>
        <Form.Item name="roleCode" label="Mã vai trò">
          <Input placeholder="ORGANIZER" allowClear />
        </Form.Item>
        <Form.Item name="action" label="Loại">
          <Select
            allowClear
            placeholder="Tất cả"
            style={{ width: 140 }}
            options={ROLE_REQUEST_ACTIONS.map((item) => ({ value: item.value, label: item.label }))}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Lọc
        </Button>
      </Form>
      {list.error ? <Alert type="error" showIcon message={errorMessage(list.error)} style={{ marginBottom: 16 }} /> : null}
      <Table<RoleRequestView>
        rowKey="id"
        columns={columns}
        dataSource={list.data}
        loading={list.isFetching}
        scroll={{ x: 960 }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        locale={{ emptyText: 'Không có yêu cầu' }}
      />
      <Modal
        title={rejecting ? `Từ chối yêu cầu #${rejecting.id}` : 'Từ chối'}
        open={Boolean(rejecting)}
        okText="Từ chối"
        cancelText="Đóng"
        confirmLoading={reject.isPending}
        onCancel={() => {
          setRejecting(null)
          reasonForm.resetFields()
        }}
        onOk={() => {
          void reasonForm.validateFields().then((values) => {
            if (rejecting) {
              reject.mutate({ id: rejecting.id, reason: values.reason.trim() })
            }
          })
        }}
        destroyOnHidden
      >
        <Form form={reasonForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do"
            rules={[
              { required: true, message: 'Nhập lý do' },
              { min: 10, max: 500, message: 'Lý do từ 10 đến 500 ký tự' },
            ]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
