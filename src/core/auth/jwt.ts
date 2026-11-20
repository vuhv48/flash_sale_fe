export type AccessTokenClaims = {
  sub?: string
  uid?: string
  authorities?: string
  exp?: number
}

export type AccessIdentity = {
  username: string
  userId: string
  roles: string[]
}

export function decodeJwtPayload<T>(token: string): T {
  const segment = token.split('.')[1]
  if (!segment) {
    throw new Error('Access token không đúng định dạng')
  }
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const json = decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
  return JSON.parse(json) as T
}

export function readAccessIdentity(accessToken: string): AccessIdentity {
  const claims = decodeJwtPayload<AccessTokenClaims>(accessToken)
  const authorities = (claims.authorities ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return {
    username: claims.sub ?? '',
    userId: claims.uid ?? '',
    roles: authorities.filter((item) => item.startsWith('ROLE_')).map((item) => item.slice('ROLE_'.length)),
  }
}
