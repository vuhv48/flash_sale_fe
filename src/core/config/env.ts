export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() ?? '',
  stompUrl: import.meta.env.VITE_STOMP_URL?.trim() ?? '',
}
