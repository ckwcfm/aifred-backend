import * as z from 'zod'

// AuthTokenHeaderSchema 用於檢查是否有傳入 Authorization header
export const AuthTokenHeaderSchema = z.object({
  authorization: z.string().jwt(),
})

export const RefreshTokenHeaderSchema = z.object({
  'refresh-token': z.string().jwt(),
})
