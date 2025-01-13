import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().default(8000),
  MONGODB_URL: z.string().url(),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
})

export const ENV = envSchema.parse(process.env)

type TEnv = z.infer<typeof envSchema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TEnv {}
  }
}
