import { Alert, Card, Col, DatePicker, Empty, Pagination, Row, Select, Space, Typography } from 'antd'
import type { Dayjs } from 'dayjs'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { errorMessage } from '@/core/http/api-error'
import { queryKeys } from '@/core/query/query-keys'
import { catalogApi } from '@/modules/events/api/catalog-api'
import { EventStatusTag } from '@/modules/events/components/EventStatusTag'
import { useEventCatalog } from '@/modules/events/hooks/use-event-catalog'
import { formatDateTime, formatMoney } from '@/shared/lib/format'

export function EventCatalogPage() {
  const navigate = useNavigate()
  const { provinces, categories } = useEventCatalog()
  const [category, setCategory] = useState<string>()
  const [provinceId, setProvinceId] = useState<string>()
  const [date, setDate] = useState<Dayjs | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(12)
  const dateValue = date ? date.format('YYYY-MM-DD') : undefined

  const events = useQuery({
    queryKey: queryKeys.catalog.events({ category, provinceId, date: dateValue, page, size }),
    queryFn: () => catalogApi.events({ category, provinceId, date: dateValue, page, size }),
  })

  function resetPage() {
    setPage(0)
  }

  return (
    <>
      <div className="fs-page-header">
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Sự kiện
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
            Sự kiện đã duyệt, đang bán, tạm dừng hoặc đã đóng bán.
          </Typography.Paragraph>
        </div>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Thể loại"
              style={{ width: '100%' }}
              loading={categories.isLoading}
              options={categories.data?.map((item) => ({ value: item.code, label: item.label }))}
              value={category}
              onChange={(value) => {
                setCategory(value)
                resetPage()
              }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Tỉnh, thành"
              style={{ width: '100%' }}
              loading={provinces.isLoading}
              options={provinces.data?.map((item) => ({ value: item.id, label: item.name }))}
              value={provinceId}
              onChange={(value) => {
                setProvinceId(value)
                resetPage()
              }}
            />
          </Col>
          <Col xs={24} md={8}>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Ngày diễn ra"
              value={date}
              onChange={(value) => {
                setDate(value)
                resetPage()
              }}
            />
          </Col>
        </Row>
      </Card>
      {events.isError ? <Alert type="error" showIcon message={errorMessage(events.error)} /> : null}
      {!events.isLoading && events.data?.items.length === 0 ? <Empty description="Chưa có sự kiện phù hợp" /> : null}
      <div className="fs-event-grid">
        {events.data?.items.map((event) => (
          <Card key={event.id} hoverable onClick={() => navigate(`/events/${event.id}`)}>
            <div className="fs-event-cover">{event.categoryLabel || 'Sự kiện'}</div>
            <Space orientation="vertical" size={4} style={{ width: '100%' }}>
              <Typography.Text type="secondary">{event.code}</Typography.Text>
              <Typography.Title level={5} style={{ margin: 0 }}>
                {event.name}
              </Typography.Title>
              <EventStatusTag status={event.status} label={event.statusLabel} />
              <Typography.Text>{[event.venueName, event.provinceName].filter(Boolean).join(' · ') || '—'}</Typography.Text>
              <Typography.Text type="secondary">Diễn ra {formatDateTime(event.startsAt)}</Typography.Text>
              <Typography.Text strong>{event.minPrice == null ? 'Chưa có vé' : `Từ ${formatMoney(event.minPrice)}`}</Typography.Text>
            </Space>
          </Card>
        ))}
      </div>
      {events.data && events.data.total > 0 ? (
        <div className="fs-catalog-pager">
          <Pagination
            current={page + 1}
            pageSize={size}
            total={events.data.total}
            showSizeChanger
            pageSizeOptions={[12, 24, 48]}
            onChange={(next, nextSize) => {
              setPage(nextSize === size ? next - 1 : 0)
              setSize(nextSize)
            }}
          />
        </div>
      ) : null}
      {events.isLoading ? <Typography.Text type="secondary">Đang tải sự kiện…</Typography.Text> : null}
    </>
  )
}
