import { Alert, Button, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { queryKeys } from '@/core/query/query-keys'
import { usePermission } from '@/modules/account/hooks/use-my-access'
import { organizerEventApi } from '@/modules/events/api/organizer-event-api'
import { EventStatusTag } from '@/modules/events/components/EventStatusTag'
import type { OrganizerEventCard } from '@/modules/events/model/types'
import { PageHeader } from '@/shared/components/PageHeader'
import { formatDateTime } from '@/shared/lib/format'

export function OrganizerEventListPage() {
  const navigate = useNavigate()
  const canCreate = usePermission('CREATE_DRAFT_EVENT')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const events = useQuery({
    queryKey: queryKeys.organizerEvents.list(page, size),
    queryFn: () => organizerEventApi.list(page, size),
  })

  const columns: TableColumnsType<OrganizerEventCard> = [
    { title: 'Mã', dataIndex: 'code', width: 120 },
    {
      title: 'Sự kiện',
      dataIndex: 'name',
      render: (_, row) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/organizer/events/${row.id}`)}>
          {row.name}
        </Button>
      ),
    },
    { title: 'Thể loại', dataIndex: 'categoryLabel', render: (value: string | null) => value || '—' },
    { title: 'Tỉnh, thành', dataIndex: 'provinceName', render: (value: string | null) => value || '—' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (_, row) => <EventStatusTag status={row.status} label={row.statusLabel} />,
    },
    { title: 'Mở bán', dataIndex: 'saleStartsAt', render: (value: string | null) => formatDateTime(value) },
    { title: 'Diễn ra', dataIndex: 'startsAt', render: (value: string | null) => formatDateTime(value) },
    { title: 'Loại vé', dataIndex: 'ticketCount', width: 90 },
    { title: 'Tạm dừng', dataIndex: 'pauseCount', width: 100, render: (value: number) => `${value}/3` },
  ]

  return (
    <>
      <PageHeader
        title="Sự kiện của tôi"
        description="Nháp, chờ duyệt và các đợt bán do bạn tạo."
        extra={
          canCreate.allowed ? (
            <Button type="primary" onClick={() => navigate('/organizer/events/new')}>
              Tạo sự kiện
            </Button>
          ) : null
        }
      />
      {events.isError ? <Alert type="error" showIcon message={errorMessage(events.error)} /> : null}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={events.data?.items}
        loading={events.isLoading}
        scroll={{ x: 960 }}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: events.data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          onChange: (next, nextSize) => {
            setPage(nextSize === size ? next - 1 : 0)
            setSize(nextSize)
          },
        }}
        expandable={{
          expandedRowRender: (row) =>
            row.rejectReason ? (
              <Typography.Text type="danger">Lý do từ chối: {row.rejectReason}</Typography.Text>
            ) : (
              <Typography.Text type="secondary">Gửi duyệt: {formatDateTime(row.submittedAt)}</Typography.Text>
            ),
          rowExpandable: (row) => Boolean(row.rejectReason || row.submittedAt),
        }}
      />
    </>
  )
}
