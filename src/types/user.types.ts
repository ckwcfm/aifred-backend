import { z } from 'zod'
import {
  createUserSchema,
  userSchema,
  loginUserSchema,
} from '@/schemas/user.schemas'

export type TUser = z.infer<typeof userSchema>
export type TCreateUser = z.infer<typeof createUserSchema>
export type TLoginUser = z.infer<typeof loginUserSchema>

export type TUserMethods = {
  comparePassword: (password: string) => Promise<boolean>
  createTokens: () => Promise<{ accessToken: string; refreshToken: string }>
}
