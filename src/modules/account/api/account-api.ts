import { http } from '@/core/http/client'
import type { MessageResponse } from '@/shared/types/api'
import type { MyPermission, Profile, RoleCatalogItem, RoleRequestView, SubmitRoleRequest } from '@/shared/types/identity'

export const accountApi = {
  profile() {
    return http.get<Profile>('/api/me/profile').then((response) => response.data)
  },
  updateProfile(body: { fullName: string; phone: string }) {
    return http.put<Profile>('/api/me/profile', body).then((response) => response.data)
  },
  myRoles() {
    return http.get<RoleCatalogItem[]>('/api/me/roles').then((response) => response.data)
  },
  myPermissions() {
    return http.get<MyPermission[]>('/api/me/permissions').then((response) => response.data)
  },
  requestableRoles() {
    return http.get<RoleCatalogItem[]>('/api/roles/requestable').then((response) => response.data)
  },
  submitRoleRequest(body: SubmitRoleRequest) {
    return http.post<MessageResponse>('/api/role-requests', body).then((response) => response.data)
  },
  myRoleRequests() {
    return http.get<RoleRequestView[]>('/api/role-requests/me').then((response) => response.data)
  },
  cancelRoleRequest(id: number) {
    return http.post<MessageResponse>(`/api/role-requests/${id}/cancel`).then((response) => response.data)
  },
}
