import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from '@/core/auth/session-store'
import { queryKeys } from '@/core/query/query-keys'
import { accountApi } from '@/modules/account/api/account-api'
import { accessCovers } from '@/shared/lib/access-level'

export function useMyRoles(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me.roles,
    queryFn: accountApi.myRoles,
    enabled,
  })
}

export function useMyPermissions() {
  return useQuery({
    queryKey: queryKeys.me.permissions,
    queryFn: accountApi.myPermissions,
  })
}

export function useHasRole(role: string) {
  const jwtRoles = useSessionStore((state) => state.roles)
  const query = useMyRoles()
  const roles = query.data ? query.data.map((item) => item.code) : jwtRoles
  return {
    ready: query.isFetched || jwtRoles.includes(role),
    allowed: roles.includes(role),
  }
}

export function usePermission(code: string, requiredLevel?: string) {
  const query = useMyPermissions()
  const found = query.data?.find((item) => item.code === code)
  const allowed = Boolean(found) && (requiredLevel ? accessCovers(found?.accessLevel ?? '', requiredLevel) : true)
  return {
    ready: query.isSuccess || query.isError,
    allowed,
  }
}

export function useAnyPermission(codes: string[]) {
  const query = useMyPermissions()
  return {
    ready: query.isSuccess || query.isError,
    allowed: codes.some((code) => query.data?.some((item) => item.code === code)),
  }
}
