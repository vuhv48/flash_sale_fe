import { http } from '@/core/http/client'
import type { EventPage, OrganizerEventCard, OrganizerEventDetail } from '@/modules/events/model/types'

export const adminEventApi = {
  list(status: string | undefined, page: number, size: number) {
    return http
      .get<EventPage<OrganizerEventCard>>('/api/admin/events', {
        params: { status: status || undefined, page, size },
      })
      .then((response) => response.data)
  },
  detail(id: string) {
    return http.get<OrganizerEventDetail>(`/api/admin/events/${id}`).then((response) => response.data)
  },
  approve(id: string) {
    return http.post<OrganizerEventDetail>(`/api/admin/events/${id}/approve`).then((response) => response.data)
  },
  reject(id: string, reason: string) {
    return http
      .post<OrganizerEventDetail>(`/api/admin/events/${id}/reject`, { reason })
      .then((response) => response.data)
  },
  pause(id: string) {
    return http.post<OrganizerEventDetail>(`/api/admin/events/${id}/pause`).then((response) => response.data)
  },
  resume(id: string) {
    return http.post<OrganizerEventDetail>(`/api/admin/events/${id}/resume`).then((response) => response.data)
  },
  cancel(id: string, reason: string) {
    return http
      .post<OrganizerEventDetail>(`/api/admin/events/${id}/cancel`, { reason })
      .then((response) => response.data)
  },
}
