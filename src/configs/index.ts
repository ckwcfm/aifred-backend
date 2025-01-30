import { connectDatabase } from '@/configs/mongdb.config'
import { createKeyPairIfNeed } from './rsa.config'
import { Application } from 'express'
import { configCors } from './cors.config'

export async function startConfigurations(app: Application) {
  await connectDatabase()
  await createKeyPairIfNeed()
  configCors(app)
}

export const expiresInOptions = {
  accessToken: 15 * 60, // 15 minutes in seconds
  refreshToken: 30 * 24 * 60 * 60, // 30 days in seconds
} as const
