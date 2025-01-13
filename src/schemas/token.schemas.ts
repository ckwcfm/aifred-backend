import { z } from 'zod'
const tokenBaseSchema = z.object({
  iat: z.number(),
  exp: z.number(),
})

export const userAccessTokenPayload = tokenBaseSchema.merge(
  z.object({
    id: z.string(),
    email: z.string(),
  })
)
