import { Socket } from 'socket.io'
import { verifyToken } from '@/services/jwt.service'
import { userAccessTokenPayload } from '@/schemas/token.schemas'
import { ApiError } from '@/utils/error.utils'

export const authMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const { token } = socket.handshake.auth
    const isUser = await verifyToken(
      token,
      'userAccessToken',
      userAccessTokenPayload
    )
    if (!isUser) {
      return next(new ApiError('UNAUTHORIZED', 'Unauthorized'))
    }
    socket.data.userId = isUser.id
    next()
  } catch (error) {
    next(error instanceof Error ? error : new Error('Unknown error occurred'))
  }
}
