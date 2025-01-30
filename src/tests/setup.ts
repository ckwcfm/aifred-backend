import { config } from 'dotenv'
import path from 'path'

// Load env file from backend directory
config({ path: path.resolve(__dirname, '../../.env') })

process.env.NODE_ENV = 'development'
// Only set MONGODB_URL if not already set in .env
if (!process.env.MONGODB_URL) {
  process.env.MONGODB_URL = 'mongodb://localhost:27017/aiFred_test'
}

import { beforeAll } from 'vitest'

beforeAll(() => {
  console.log('Environment loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URL: process.env.MONGODB_URL,
  })
})
