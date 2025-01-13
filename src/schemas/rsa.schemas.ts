import z from 'zod'
export const RSAType = ['userAccessToken', 'userRefreshToken'] as const

export const RSATypeSchema = z.enum(RSAType)

export const RSASchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
  type: RSATypeSchema,
  deprecatedAt: z.date(),
  expireAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
