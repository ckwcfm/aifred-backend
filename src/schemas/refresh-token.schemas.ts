import { z } from 'zod'
import { MongoObjectIdSchema } from './mongoos.schemas'

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().jwt(),
  userId: MongoObjectIdSchema(),
  expiryAt: z.coerce.date(),
})
