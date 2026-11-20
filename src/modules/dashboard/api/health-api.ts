import { http } from '@/core/http/client'

export type HealthReport = {
  status?: string
}

export const healthApi = {
  current() {
    return http.get<HealthReport>('/actuator/health').then((response) => response.data)
  },
}
