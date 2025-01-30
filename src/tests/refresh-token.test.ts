import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import { RefreshTokenModel } from '@/models/refreash-token.model'
import { TEST_REFRESH_TOKEN_EXPIRY } from '@/constants/token.constants'
import { connectDatabase } from '@/configs/mongdb.config'

describe('RefreshToken Auto Deletion', () => {
  beforeAll(async () => {
    await connectDatabase()
    console.log('🔌 Connected to test database')
  })

  afterAll(async () => {
    await mongoose.connection.close()
    console.log('🔌 Disconnected from test database')
  })

  it(
    'should auto-delete expired refresh tokens after 10 seconds',
    async () => {
      console.log('⏱️  Starting refresh token TTL test')

      // Create a test refresh token
      const testToken = await RefreshTokenModel.create({
        userId: new mongoose.Types.ObjectId(),
        refreshToken: 'test-refresh-token',
        expiryAt: new Date(Date.now() + TEST_REFRESH_TOKEN_EXPIRY * 1000),
      })
      console.log(`📝 Created test token with ID: ${testToken._id}`)
      console.log(
        `⏳ Token will expire in ${TEST_REFRESH_TOKEN_EXPIRY} seconds`
      )

      // Verify token was created
      expect(testToken).toBeDefined()
      expect(testToken.refreshToken).toBe('test-refresh-token')

      // expire take at least 60 seconds
      // Wait for token to expire (plus buffer)
      console.log('⏳ Waiting 15 seconds for token')
      await new Promise((resolve) => setTimeout(resolve, 15 * 1000))

      // Try to find the token - it should be deleted
      const expiredToken = await RefreshTokenModel.findById(testToken._id)
      console.log(
        expiredToken
          ? '❌ Token still exists!'
          : '✅ Token was successfully deleted'
      )
      expect(expiredToken).toBeNull()
    },
    20 * 1000 // 20 second timeout
  )
})
