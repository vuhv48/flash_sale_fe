export const EVENT_STATUSES = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'APPROVED', label: 'Đã duyệt, sắp mở bán' },
  { value: 'ON_SALE', label: 'Đang bán' },
  { value: 'PAUSED', label: 'Tạm dừng' },
  { value: 'SALE_ENDED', label: 'Kết thúc bán' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'COMPLETED', label: 'Đã diễn ra' },
] as const

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'default',
  PENDING_REVIEW: 'gold',
  REJECTED: 'red',
  APPROVED: 'blue',
  ON_SALE: 'green',
  PAUSED: 'orange',
  SALE_ENDED: 'default',
  CANCELLED: 'red',
  COMPLETED: 'purple',
}

const AVAILABILITY_COLOR: Record<string, string> = {
  AVAILABLE: 'green',
  LOW: 'orange',
  SOLD_OUT: 'red',
}

export function statusColor(status: string) {
  return STATUS_COLOR[status] ?? 'default'
}

export function availabilityColor(code: string) {
  return AVAILABILITY_COLOR[code] ?? 'default'
}

export function countdownLabel(target: string) {
  if (target === 'SALE_START') {
    return 'Mở bán sau'
  }
  if (target === 'SALE_END') {
    return 'Đóng bán sau'
  }
  return ''
}

export function isEditableStatus(status: string) {
  return status === 'DRAFT' || status === 'REJECTED'
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  const clock = [hours, minutes, rest].map((part) => String(part).padStart(2, '0')).join(':')
  return days > 0 ? `${days} ngày ${clock}` : clock
}
