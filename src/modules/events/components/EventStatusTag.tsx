import { Tag } from 'antd'
import { statusColor } from '@/modules/events/model/labels'

export function EventStatusTag({ status, label }: { status: string; label: string }) {
  return <Tag color={statusColor(status)}>{label}</Tag>
}
