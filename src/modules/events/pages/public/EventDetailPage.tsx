import { Alert, Button, Card, Descriptions, Table, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { queryClient } from '@/core/query/query-client'
import { queryKeys } from '@/core/query/query-keys'
import { catalogApi } from '@/modules/events/api/catalog-api'
import { AvailabilityTag } from '@/modules/events/components/AvailabilityTag'
import { EventStatusTag } from '@/modules/events/components/EventStatusTag'
import { SaleCountdown } from '@/modules/events/components/SaleCountdown'
import type { PublicTicketOffer } from '@/modules/events/model/types'
import { formatDateTime, formatMoney } from '@/shared/lib/format'

export function EventDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const event = useQuery({
    queryKey: queryKeys.catalog.event(id),
    queryFn: () => catalogApi.event(id),
    enabled: Boolean(id),
  })
  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.catalog.event(id) })
  }, [id])

  const columns: TableColumnsType<PublicTicketOffer> = [
    { title: 'Loại vé', dataIndex: 'name' },
    { title: 'Giá', dataIndex: 'price', render: (value: number) => formatMoney(value) },
    {
      title: 'Tình trạng',
      dataIndex: 'availability',
      render: (_, row) => <AvailabilityTag code={row.availability} label={row.availabilityLabel} />,
    },
  ]

  if (event.isError) {
    return <Alert type="error" showIcon message={errorMessage(event.error)} />
  }
  if (!event.data) {
    return <Typography.Text type="secondary">Đang tải sự kiện…</Typography.Text>
  }

  const detail = event.data
  return (
    <>
      <Button type="link" style={{ paddingInline: 0 }} onClick={() => navigate('/events')}>
        Tất cả sự kiện
      </Button>
      <div className="fs-page-header">
        <div>
          <Typography.Text type="secondary">{detail.code}</Typography.Text>
          <Typography.Title level={2} style={{ margin: '4px 0' }}>
            {detail.name}
          </Typography.Title>
          <EventStatusTag status={detail.status} label={detail.statusLabel} />
        </div>
        <Card>
          <SaleCountdown target={detail.countdownTarget} seconds={detail.countdownSeconds} onElapsed={refresh} />
        </Card>
      </div>
      <Card>
        <Descriptions column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Thể loại">{detail.categoryLabel || '—'}</Descriptions.Item>
          <Descriptions.Item label="Tỉnh, thành">{detail.provinceName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Địa điểm">{detail.venueName || '—'}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{detail.venueAddress || '—'}</Descriptions.Item>
          <Descriptions.Item label="Bắt đầu">{formatDateTime(detail.startsAt)}</Descriptions.Item>
          <Descriptions.Item label="Kết thúc">{formatDateTime(detail.endsAt)}</Descriptions.Item>
          <Descriptions.Item label="Mở phòng chờ">{formatDateTime(detail.waitingRoomOpensAt)}</Descriptions.Item>
          <Descriptions.Item label="Mở bán">{formatDateTime(detail.saleStartsAt)}</Descriptions.Item>
          <Descriptions.Item label="Đóng bán">{formatDateTime(detail.saleEndsAt)}</Descriptions.Item>
        </Descriptions>
        <Typography.Paragraph style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>
          {detail.description || 'Sự kiện chưa có mô tả.'}
        </Typography.Paragraph>
      </Card>
      <Card title="Loại vé" style={{ marginTop: 16 }}>
        <Table rowKey="id" columns={columns} dataSource={detail.ticketTypes} pagination={false} />
      </Card>
    </>
  )
}
