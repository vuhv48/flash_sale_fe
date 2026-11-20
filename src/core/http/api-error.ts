import axios, { type AxiosError } from 'axios'

type ErrorBody = {
  success?: boolean
  error?: {
    status?: number
    code?: string
    message?: string
    details?: Record<string, string>
  }
  message?: string
}

export class ApiClientError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, string>

  constructor(status: number, code: string, message: string, details: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function errorMessage(error: unknown, fallback = 'Không thực hiện được. Thử lại sau.') {
  if (error instanceof ApiClientError && error.message) {
    return error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function toApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error
  }
  if (!axios.isAxiosError(error)) {
    return new ApiClientError(0, 'NETWORK', 'Không kết nối được máy chủ')
  }
  return fromAxios(error)
}

function fromAxios(error: AxiosError<ErrorBody>): ApiClientError {
  const status = error.response?.status ?? 0
  const body = error.response?.data
  const nested = body?.error
  if (nested?.message) {
    return new ApiClientError(nested.status ?? status, nested.code ?? 'ERROR', nested.message, nested.details ?? {})
  }
  if (typeof body?.message === 'string' && body.message) {
    return new ApiClientError(status, 'ERROR', body.message)
  }
  if (status === 401) {
    return new ApiClientError(status, 'UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ')
  }
  if (status === 403) {
    return new ApiClientError(status, 'FORBIDDEN', 'Bạn không có quyền thực hiện')
  }
  if (status === 0 || !error.response) {
    return new ApiClientError(0, 'NETWORK', 'Không kết nối được máy chủ')
  }
  return new ApiClientError(status, 'ERROR', 'Máy chủ trả về lỗi')
}
