export type RoleCatalogItem = {
  code: string
  name: string
  description: string
  requiresOrgProfile: boolean
}

export type MyPermission = {
  code: string
  name: string
  group: string
  action: string
  accessLevel: 'ALL' | 'OWN' | 'AUTO' | string
}

export type RoleRequestAction = 'ADD' | 'REMOVE'

export type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type OrganizerApplication = {
  orgName: string
  taxCode: string
  representative: string
}

export type SubmitRoleRequest = {
  roleCode: string
  action: RoleRequestAction
  note?: string
  organizer?: OrganizerApplication
}

export type RoleRequestView = {
  id: number
  userId: string
  username: string
  roleCode: string
  roleName: string
  action: RoleRequestAction
  status: RoleRequestStatus
  note: string | null
  rejectReason: string | null
  approveBlocked: boolean
  approveBlockReason: string | null
  createdAt: string
  reviewedAt: string | null
}

export type AdminRoleRequestQuery = {
  status: RoleRequestStatus
  roleCode?: string
  action?: RoleRequestAction
}

export type GrantRoleRequest = {
  roleCode: string
  reason?: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type Profile = {
  email: string
  fullName: string
  phone: string
  enabled: boolean
}

export type AdminUser = {
  id: string
  email: string
  fullName: string
  phone: string
  enabled: boolean
}
