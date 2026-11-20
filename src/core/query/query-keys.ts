import type { AdminRoleRequestQuery } from '@/shared/types/identity'

export const queryKeys = {
  health: ['health'] as const,
  me: {
    roles: ['me', 'roles'] as const,
    permissions: ['me', 'permissions'] as const,
    profile: ['me', 'profile'] as const,
  },
  adminUsers: (name: string) => ['admin', 'users', name] as const,
  catalog: {
    provinces: ['catalog', 'provinces'] as const,
    categories: ['catalog', 'categories'] as const,
    events: (filter: { category?: string; provinceId?: string; date?: string; page: number; size: number }) =>
      ['catalog', 'events', filter] as const,
    event: (id: string) => ['catalog', 'events', id] as const,
  },
  organizerEvents: {
    list: (page: number, size: number) => ['organizer', 'events', page, size] as const,
    detail: (id: string) => ['organizer', 'events', id] as const,
  },
  adminEvents: {
    list: (status: string, page: number, size: number) => ['admin', 'events', status, page, size] as const,
    detail: (id: string) => ['admin', 'events', id] as const,
  },
  roles: {
    requestable: ['roles', 'requestable'] as const,
  },
  roleRequests: {
    mine: ['role-requests', 'me'] as const,
    admin: (query: AdminRoleRequestQuery) => ['admin', 'role-requests', query] as const,
  },
}
