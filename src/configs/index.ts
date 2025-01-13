import { connectDatabase } from '@/configs/mongdb.config'
import { createKeyPairIfNeed } from './rsa.config'
import { Application } from 'express'
import { configCors } from './cors.config'

export async function startConfigurations(app: Application) {
  await connectDatabase()
  await createKeyPairIfNeed()
  configCors(app)
}
