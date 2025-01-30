import { TRSAType } from '@/types/rsa.types'

export const expiresInOptions: Record<TRSAType, number> = {
  userAccessToken: 10, // 1 hour in seconds
  userRefreshToken: 365 * 24 * 60 * 60, // 365 days in seconds
} as const

export const TEST_REFRESH_TOKEN_EXPIRY = 10 // 5 minutes in seconds
