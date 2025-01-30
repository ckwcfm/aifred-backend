import { ENV } from '@/schemas/env.schemas'
import cors from 'cors'
import { Application } from 'express'

export const configCors = (app: Application) => {
  if (process.env.NODE_ENV === 'production') {
    app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }))
  } else {
    app.use(
      cors({
        origin: 'http://localhost:5173',
        credentials: true,
      })
    )
  }
}
