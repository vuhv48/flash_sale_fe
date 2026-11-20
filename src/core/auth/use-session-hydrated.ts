import { useEffect, useState } from 'react'
import { useSessionStore } from '@/core/auth/session-store'

export function useSessionHydrated() {
  const [hydrated, setHydrated] = useState(() => useSessionStore.persist.hasHydrated())

  useEffect(() => {
    if (useSessionStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useSessionStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
