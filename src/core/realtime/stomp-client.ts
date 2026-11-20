import { Client } from '@stomp/stompjs'
import { useSessionStore } from '@/core/auth/session-store'
import { env } from '@/core/config/env'

export function isRealtimeConfigured() {
  return env.stompUrl.length > 0
}

/** Backend chưa có broker. Chỉ tạo client khi biến VITE_STOMP_URL được đặt. */
export function createRealtimeClient() {
  if (!isRealtimeConfigured()) {
    return null
  }
  const client = new Client({
    brokerURL: env.stompUrl,
    reconnectDelay: 5_000,
    heartbeatIncoming: 10_000,
    heartbeatOutgoing: 10_000,
    beforeConnect: () => {
      const token = useSessionStore.getState().accessToken
      client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {}
    },
  })
  return client
}
