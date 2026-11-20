import { http } from '@/core/http/client'
import type { MessageResponse } from '@/shared/types/api'
import type { AdminRoleRequestQuery, GrantRoleRequest, RoleRequestView } from '@/shared/types/identity'

export const adminRoleApi = {
  list(query: AdminRoleRequestQuery) {
    return http
      .get<RoleRequestView[]>('/api/admin/role-requests', {
        params: {
          status: query.status,
          roleCode: query.roleCode || undefined,
          action: query.action || undefined,
        },
      })
      .then((response) => response.data)
  },
  approve(id: number) {
    return http.post<MessageResponse>(`/api/admin/role-requests/${id}/approve`).then((response) => response.data)
  },
  reject(id: number, reason: string) {
    return http
      .post<MessageResponse>(`/api/admin/role-requests/${id}/reject`, { reason })
      .then((response) => response.data)
  },
  grant(username: string, body: GrantRoleRequest) {
    return http
      .post<MessageResponse>(`/api/admin/users/${encodeURIComponent(username)}/roles`, body)
      .then((response) => response.data)
  },
  revoke(username: string, roleCode: string, reason?: string) {
    return http
      .delete<MessageResponse>(`/api/admin/users/${encodeURIComponent(username)}/roles/${encodeURIComponent(roleCode)}`, {
        params: { reason: reason || undefined },
      })
      .then((response) => response.data)
  },
}
