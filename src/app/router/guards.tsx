import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionHydrated } from '@/core/auth/use-session-hydrated'
import { useSessionStore } from '@/core/auth/session-store'
import { useAnyPermission, usePermission } from '@/modules/account/hooks/use-my-access'
import { FullScreenSpin } from '@/shared/components/FullScreenSpin'
import { ForbiddenPage } from '@/app/pages/ForbiddenPage'

export function SessionGate() {
  const hydrated = useSessionHydrated()
  if (!hydrated) {
    return <FullScreenSpin />
  }
  return <Outlet />
}

export function GuestOnly() {
  const accessToken = useSessionStore((state) => state.accessToken)
  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

export function RequireAuth() {
  const accessToken = useSessionStore((state) => state.accessToken)
  const location = useLocation()
  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function RequirePermission({ code }: { code: string }) {
  const gate = usePermission(code)
  if (!gate.ready) {
    return <FullScreenSpin />
  }
  if (!gate.allowed) {
    return <ForbiddenPage />
  }
  return <Outlet />
}

export function RequireAnyPermission({ codes }: { codes: string[] }) {
  const gate = useAnyPermission(codes)
  if (!gate.ready) {
    return <FullScreenSpin />
  }
  if (!gate.allowed) {
    return <ForbiddenPage />
  }
  return <Outlet />
}
