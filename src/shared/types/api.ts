export type TokenPair = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresInSeconds: number
  refreshExpiresInSeconds: number
}

export type MessageResponse = {
  message: string
}

export type RegisterResponse = TokenPair & {
  message: string
}
