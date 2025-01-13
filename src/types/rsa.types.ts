import z from 'zod'
import { RSASchema } from '@/schemas/rsa.schemas'

export type TRSAType = z.infer<typeof RSASchema>['type']
export type TRSA = z.infer<typeof RSASchema>
