import * as z from 'zod'

// AuthTokenHeaderSchema 用於檢查是否有傳入 Authorization header
export const AuthTokenHeaderSchema = z.object({
  authorization: z
    .string()
    .refine((value) => value.startsWith('Bearer '), {
      message: 'Invalid Authorization header',
    })
    .transform((value) => value.replace('Bearer ', '')),
})
