export const SYSTEM_ROLES = [
  { code: 'GUEST', name: 'Khách' },
  { code: 'CUSTOMER', name: 'Khách hàng' },
  { code: 'ORGANIZER', name: 'Ban tổ chức' },
  { code: 'ADMIN', name: 'Quản trị viên' },
  { code: 'SYSTEM', name: 'Hệ thống' },
] as const

export const ROLE_REQUEST_STATUS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'CANCELLED', label: 'Đã hủy' },
] as const

export const ROLE_REQUEST_ACTIONS = [
  { value: 'ADD', label: 'Xin thêm' },
  { value: 'REMOVE', label: 'Xin gỡ' },
] as const
