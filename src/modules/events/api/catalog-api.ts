import { http } from '@/core/http/client'
import type {
  CategoryItem,
  EventPage,
  ProvinceItem,
  PublicEventCard,
  PublicEventDetail,
  PublicEventQuery,
} from '@/modules/events/model/types'

export const catalogApi = {
  provinces() {
    return http.get<ProvinceItem[]>('/api/provinces').then((response) => response.data)
  },
  categories() {
    return http.get<CategoryItem[]>('/api/event-categories').then((response) => response.data)
  },
  events(query: PublicEventQuery) {
    return http
      .get<EventPage<PublicEventCard>>('/api/events', { params: query })
      .then((response) => response.data)
  },
  event(id: string) {
    return http.get<PublicEventDetail>(`/api/events/${id}`).then((response) => response.data)
  },
}
