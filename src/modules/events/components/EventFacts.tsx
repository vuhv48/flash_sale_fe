import { Descriptions } from 'antd'
import { formatDateTime } from '@/shared/lib/format'
import type { OrganizerEventDetail } from '@/modules/events/model/types'

export function EventFacts({ event, showOwner = false }: { event: OrganizerEventDetail; showOwner?: boolean }) {
  return (
    <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="small">
      <Descriptions.Item label="Mã">{event.code}</Descriptions.Item>
      <Descriptions.Item label="Thể loại">{event.categoryLabel || '—'}</Descriptions.Item>
      <Descriptions.Item label="Tỉnh, thành">{event.provinceName || '—'}</Descriptions.Item>
      <Descriptions.Item label="Địa điểm">{event.venueName || '—'}</Descriptions.Item>
      <Descriptions.Item label="Địa chỉ" span={2}>
        {event.venueAddress || '—'}
      </Descriptions.Item>
      <Descriptions.Item label="Bắt đầu">{formatDateTime(event.startsAt)}</Descriptions.Item>
      <Descriptions.Item label="Kết thúc">{formatDateTime(event.endsAt)}</Descriptions.Item>
      <Descriptions.Item label="Mở phòng chờ">{formatDateTime(event.waitingRoomOpensAt)}</Descriptions.Item>
      <Descriptions.Item label="Mở bán">{formatDateTime(event.saleStartsAt)}</Descriptions.Item>
      <Descriptions.Item label="Đóng bán">{formatDateTime(event.saleEndsAt)}</Descriptions.Item>
      <Descriptions.Item label="Vé mỗi tài khoản">{event.maxTicketsPerUser}</Descriptions.Item>
      <Descriptions.Item label="Giữ chỗ">{event.holdMinutes} phút</Descriptions.Item>
      <Descriptions.Item label="Tốc độ vào">{event.admissionRate} người/giây</Descriptions.Item>
      <Descriptions.Item label="Gửi duyệt">{formatDateTime(event.submittedAt)}</Descriptions.Item>
      <Descriptions.Item label="Duyệt lúc">{formatDateTime(event.reviewedAt)}</Descriptions.Item>
      <Descriptions.Item label="Tạm dừng của ban tổ chức">{event.pauseCount}/3</Descriptions.Item>
      <Descriptions.Item label="Lúc tạm dừng">{formatDateTime(event.pausedAt)}</Descriptions.Item>
      {showOwner ? <Descriptions.Item label="Ban tổ chức">{event.organizerId}</Descriptions.Item> : null}
      <Descriptions.Item label="Mô tả" span={2}>
        {event.description || '—'}
      </Descriptions.Item>
    </Descriptions>
  )
}
