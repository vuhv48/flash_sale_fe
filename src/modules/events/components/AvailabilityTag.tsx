import { Tag } from 'antd'
import { availabilityColor } from '@/modules/events/model/labels'

export function AvailabilityTag({ code, label }: { code: string; label: string }) {
  return <Tag color={availabilityColor(code)}>{label}</Tag>
}
