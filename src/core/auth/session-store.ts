import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { readAccessIdentity } from '@/core/auth/jwt'
import type { TokenPair } from '@/shared/types/api'

type SessionState = {
  accessToken: string | null
  refreshToken: string | null
  username: string | null
  userId: string | null
  roles: string[]
  applyTokens: (tokens: TokenPair) => void
  clear: () => void
}

const emptySession = {
  accessToken: null,
  refreshToken: null,
  username: null,
  userId: null,
  roles: [] as string[],
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...emptySession,
      applyTokens: (tokens) => {
        const identity = readAccessIdentity(tokens.accessToken)
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          username: identity.username,
          userId: identity.userId,
          roles: identity.roles,
        })
      },
      clear: () => set(emptySession),
    }),
    { name: 'flash-sale.session' },
  ),
)
