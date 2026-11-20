import { http } from '@/core/http/client'
import type { MessageResponse, RegisterResponse, TokenPair } from '@/shared/types/api'
import type { ChangePasswordRequest } from '@/shared/types/identity'

export type LoginBody = {
  email: string
  password: string
}

export type RegisterBody = {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phone: string
  acceptedTerms: true
}

export const authApi = {
  login(body: LoginBody) {
    return http.post<TokenPair>('/api/auth/login', body).then((response) => response.data)
  },
  register(body: RegisterBody) {
    return http.post<RegisterResponse>('/api/auth/register', body).then((response) => response.data)
  },
  forgotPassword(email: string) {
    return http.post<MessageResponse>('/api/auth/forgot-password', { email }).then((response) => response.data)
  },
  resetPassword(body: { token: string; newPassword: string }) {
    return http.post<MessageResponse>('/api/auth/reset-password', body).then((response) => response.data)
  },
  logout() {
    return http.post<MessageResponse>('/api/auth/logout').then((response) => response.data)
  },
  changePassword(body: ChangePasswordRequest) {
    return http.post<MessageResponse>('/api/auth/change-password', body).then((response) => response.data)
  },
}
