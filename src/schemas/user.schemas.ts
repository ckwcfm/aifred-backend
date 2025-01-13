import { z } from 'zod'
import { MongoObjectIdSchema } from './mongoos.schemas'

export const userSchema = z.object({
  id: MongoObjectIdSchema(),
  email: z.string().email(),
  password: z.string().min(6),
})

export const createUserSchema = z.object({
  email: z.string().email({
    message: 'Invalid email',
  }),
  password: z.string().min(6),
})

export const loginUserSchema = createUserSchema

export const userJWTPayloadSchema = userSchema.pick({ id: true, email: true })
