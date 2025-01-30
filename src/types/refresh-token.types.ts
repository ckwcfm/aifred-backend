import { RefreshTokenSchema } from '@/schemas/refresh-token.schemas'
import { z } from 'zod'

export type TRefreshToken = z.infer<typeof RefreshTokenSchema>
