import { http } from '@/core/http/client'
import type { MessageResponse } from '@/shared/types/api'
import type { AdminUser } from '@/shared/types/identity'

export const adminUserApi = {
  search(name: string) {
    return http
      .get<AdminUser[]>('/api/admin/users', { params: { name: name || undefined } })
      .then((response) => response.data)
  },
  lock(username: string, reason: string) {
    return http
      .post<MessageResponse>(`/api/admin/users/${encodeURIComponent(username)}/lock`, { reason })
      .then((response) => response.data)
  },
  unlock(username: string, reason: string) {
    return http
      .post<MessageResponse>(`/api/admin/users/${encodeURIComponent(username)}/unlock`, { reason })
      .then((response) => response.data)
  },
}
