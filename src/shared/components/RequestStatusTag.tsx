import { Tag } from 'antd'
import type { RoleRequestStatus } from '@/shared/types/identity'

const LABEL: Record<RoleRequestStatus, { color: string; text: string }> = {
  PENDING: { color: 'gold', text: 'Chờ duyệt' },
  APPROVED: { color: 'green', text: 'Đã duyệt' },
  REJECTED: { color: 'red', text: 'Từ chối' },
  CANCELLED: { color: 'default', text: 'Đã hủy' },
}

export function RequestStatusTag({ status }: { status: RoleRequestStatus }) {
  const item = LABEL[status] ?? { color: 'default', text: status }
  return <Tag color={item.color}>{item.text}</Tag>
}
