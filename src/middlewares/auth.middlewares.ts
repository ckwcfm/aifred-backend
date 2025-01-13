import { AuthTokenHeaderSchema } from '@/schemas/express.schemas'
import { userAccessTokenPayload } from '@/schemas/token.schemas'
import { verifyToken } from '@/services/jwt.service'
import { Response, Request, NextFunction } from 'express'

export const isUser = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = await AuthTokenHeaderSchema.parseAsync(
      request.headers
    )
    const user = await verifyToken(
      authorization,
      'userAccessToken',
      userAccessTokenPayload
    )
    response.locals.user = user
    next()
  } catch (error) {
    next(error)
  }
}
