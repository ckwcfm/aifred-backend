import { expiresInOptions } from '@/constants/token.constants'
import { RefreshTokenModel } from '@/models/refreash-token.model'

export async function saveRefreshToken(
  userId: string,
  refreshToken: string,
  expiryAt: Date = new Date(
    Date.now() + expiresInOptions.userRefreshToken * 1000
  )
) {
  await RefreshTokenModel.create({
    userId,
    refreshToken,
    expiryAt,
  })
}

export async function deleteRefreshToken(refreshToken: string) {
  await RefreshTokenModel.deleteOne({ refreshToken })
}
