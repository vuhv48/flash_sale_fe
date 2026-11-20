import { Alert, Button, Select, Table } from 'antd'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { queryKeys } from '@/core/query/query-keys'
import { adminEventApi } from '@/modules/events/api/admin-event-api'
import { EventStatusTag } from '@/modules/events/components/EventStatusTag'
import { EVENT_STATUSES } from '@/modules/events/model/labels'
import type { OrganizerEventCard } from '@/modules/events/model/types'
import { PageHeader } from '@/shared/components/PageHeader'
import { formatDateTime } from '@/shared/lib/format'

export function AdminEventListPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<string>()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)
  const events = useQuery({
    queryKey: queryKeys.adminEvents.list(status ?? '', page, size),
    queryFn: () => adminEventApi.list(status, page, size),
  })

  const columns: TableColumnsType<OrganizerEventCard> = [
    { title: 'Mã', dataIndex: 'code', width: 120 },
    {
      title: 'Sự kiện',
      dataIndex: 'name',
      render: (_, row) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/admin/events/${row.id}`)}>
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
    { title: 'Gửi duyệt', dataIndex: 'submittedAt', render: (value: string | null) => formatDateTime(value) },
    { title: 'Mở bán', dataIndex: 'saleStartsAt', render: (value: string | null) => formatDateTime(value) },
    { title: 'Loại vé', dataIndex: 'ticketCount', width: 90 },
  ]

  return (
    <>
      <PageHeader
        title="Duyệt sự kiện"
        description="Xem mọi sự kiện, duyệt hoặc từ chối bản chờ, tạm dừng và hủy đợt bán."
      />
      <Select
        allowClear
        placeholder="Mọi trạng thái"
        style={{ width: 260, marginBottom: 16 }}
        options={EVENT_STATUSES.map((item) => ({ value: item.value, label: item.label }))}
        value={status}
        onChange={(value) => {
          setStatus(value)
          setPage(0)
        }}
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
      />
    </>
  )
}
