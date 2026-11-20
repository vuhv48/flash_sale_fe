import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { TokenPair } from '@/shared/types/api'
import { env } from '@/core/config/env'
import { useSessionStore } from '@/core/auth/session-store'
import { ApiClientError, toApiError } from '@/core/http/api-error'

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const PUBLIC_AUTH = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
]

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function rotateRefreshToken(): Promise<string | null> {
  const refreshToken = useSessionStore.getState().refreshToken
  if (!refreshToken) {
    return null
  }
  try {
    const { data } = await axios.post<TokenPair>(
      `${env.apiBaseUrl}/api/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    useSessionStore.getState().applyTokens(data)
    return data.accessToken
  } catch {
    useSessionStore.getState().clear()
    return null
  }
}

function redirectToLogin() {
  if (!window.location.pathname.startsWith('/login')) {
    window.location.assign('/login')
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    const status = error.response?.status
    const url = config?.url ?? ''
    const isPublicAuth = PUBLIC_AUTH.some((path) => url.includes(path))

    if (status === 401 && config && !config._retry && !isPublicAuth) {
      config._retry = true
      refreshing ??= rotateRefreshToken().finally(() => {
        refreshing = null
      })
      const nextAccessToken = await refreshing
      if (nextAccessToken) {
        config.headers.set('Authorization', `Bearer ${nextAccessToken}`)
        return http(config)
      }
      redirectToLogin()
    }

    return Promise.reject(toApiError(error))
  },
)

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}
