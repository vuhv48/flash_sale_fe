import { http } from '@/core/http/client'
import type {
  AttachEventImageRequest,
  EventPage,
  OrganizerEventCard,
  OrganizerEventDetail,
  SaveEventRequest,
  SaveTicketTypeRequest,
} from '@/modules/events/model/types'

export const organizerEventApi = {
  list(page: number, size: number) {
    return http
      .get<EventPage<OrganizerEventCard>>('/api/organizer/events', { params: { page, size } })
      .then((response) => response.data)
  },
  detail(id: string) {
    return http.get<OrganizerEventDetail>(`/api/organizer/events/${id}`).then((response) => response.data)
  },
  create(body: SaveEventRequest) {
    return http.post<OrganizerEventDetail>('/api/organizer/events', body).then((response) => response.data)
  },
  update(id: string, body: SaveEventRequest) {
    return http.put<OrganizerEventDetail>(`/api/organizer/events/${id}`, body).then((response) => response.data)
  },
  addTicket(id: string, body: SaveTicketTypeRequest) {
    return http
      .post<OrganizerEventDetail>(`/api/organizer/events/${id}/ticket-types`, body)
      .then((response) => response.data)
  },
  updateTicket(id: string, ticketTypeId: string, body: SaveTicketTypeRequest) {
    return http
      .put<OrganizerEventDetail>(`/api/organizer/events/${id}/ticket-types/${ticketTypeId}`, body)
      .then((response) => response.data)
  },
  deleteTicket(id: string, ticketTypeId: string) {
    return http
      .delete<OrganizerEventDetail>(`/api/organizer/events/${id}/ticket-types/${ticketTypeId}`)
      .then((response) => response.data)
  },
  attachImage(id: string, body: AttachEventImageRequest) {
    return http
      .post<OrganizerEventDetail>(`/api/organizer/events/${id}/images`, body)
      .then((response) => response.data)
  },
  deleteImage(id: string, imageId: string) {
    return http
      .delete<OrganizerEventDetail>(`/api/organizer/events/${id}/images/${imageId}`)
      .then((response) => response.data)
  },
  submit(id: string) {
    return http.post<OrganizerEventDetail>(`/api/organizer/events/${id}/submit`).then((response) => response.data)
  },
  pause(id: string) {
    return http.post<OrganizerEventDetail>(`/api/organizer/events/${id}/pause`).then((response) => response.data)
  },
  resume(id: string) {
    return http.post<OrganizerEventDetail>(`/api/organizer/events/${id}/resume`).then((response) => response.data)
  },
}
