export type EventPage<T> = {
  items: T[]
  total: number
  page: number
  size: number
}

export type ProvinceItem = {
  id: string
  gsoCode: string
  name: string
  shortName: string
  type: 'CITY' | 'PROVINCE'
}

export type CategoryItem = {
  code: string
  label: string
}

export type PublicEventCard = {
  id: string
  code: string
  name: string
  category: string | null
  categoryLabel: string | null
  provinceName: string | null
  venueName: string | null
  startsAt: string | null
  saleStartsAt: string | null
  saleEndsAt: string | null
  status: string
  statusLabel: string
  coverDocumentId: string | null
  minPrice: number | null
}

export type PublicTicketOffer = {
  id: string
  name: string
  price: number
  availability: 'AVAILABLE' | 'LOW' | 'SOLD_OUT' | string
  availabilityLabel: string
  sortOrder: number
}

export type PublicEventDetail = {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  categoryLabel: string | null
  provinceName: string | null
  venueName: string | null
  venueAddress: string | null
  startsAt: string | null
  endsAt: string | null
  waitingRoomOpensAt: string | null
  saleStartsAt: string | null
  saleEndsAt: string | null
  status: string
  statusLabel: string
  coverDocumentId: string | null
  ticketTypes: PublicTicketOffer[]
  serverNow: string
  countdownTarget: 'SALE_START' | 'SALE_END' | 'NONE' | string
  countdownSeconds: number
}

export type OrganizerEventCard = {
  id: string
  code: string
  name: string
  category: string | null
  categoryLabel: string | null
  provinceName: string | null
  status: string
  statusLabel: string
  saleStartsAt: string | null
  startsAt: string | null
  submittedAt: string | null
  rejectReason: string | null
  pauseCount: number
  ticketCount: number
  organizerId: string
}

export type OrganizerTicketType = {
  id: string
  name: string
  price: number
  totalQuantity: number
  heldQuantity: number
  soldQuantity: number
  available: number
  sortOrder: number
  salePaused: boolean
}

export type EventImageView = {
  id: string
  type: 'EVENT_COVER' | 'EVENT_IMAGE' | string
  documentId: string | null
  fileName: string
  mimeType: string
  sortOrder: number
}

export type OrganizerEventDetail = {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  categoryLabel: string | null
  provinceId: string | null
  provinceName: string | null
  venueName: string | null
  venueAddress: string | null
  startsAt: string | null
  endsAt: string | null
  waitingRoomOpensAt: string | null
  saleStartsAt: string | null
  saleEndsAt: string | null
  maxTicketsPerUser: number
  holdMinutes: number
  admissionRate: number
  status: string
  statusLabel: string
  submittedAt: string | null
  reviewedAt: string | null
  rejectReason: string | null
  pauseCount: number
  pausedAt: string | null
  cancelReason: string | null
  organizerId: string
  ticketTypes: OrganizerTicketType[]
  images: EventImageView[]
}

export type SaveEventRequest = {
  name: string
  description: string | null
  category: string | null
  venueName: string | null
  venueAddress: string | null
  provinceId: string | null
  startsAt: string | null
  endsAt: string | null
  waitingRoomOpensAt: string | null
  saleStartsAt: string | null
  saleEndsAt: string | null
  maxTicketsPerUser: number | null
}

export type SaveTicketTypeRequest = {
  name: string
  price: number
  totalQuantity: number
  sortOrder: number | null
}

export type AttachEventImageRequest = {
  type: string
  fileName: string
  mimeType: string
  sizeBytes: number
  sortOrder: number | null
}

export type PublicEventQuery = {
  category?: string
  provinceId?: string
  date?: string
  page: number
  size: number
}
