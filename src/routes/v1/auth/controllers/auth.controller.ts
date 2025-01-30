import {
  AuthTokenHeaderSchema,
  RefreshTokenHeaderSchema,
} from '@/schemas/express.schemas'
import {
  createUserSchema,
  loginUserSchema,
  userJWTPayloadSchema,
} from '@/schemas/user.schemas'
import { createToken, verifyToken } from '@/services/jwt.service'
import { createUser, getUserByEmail } from '@/services/user.service'
import { ApiError } from '@/utils/error.utils'
import { Request, Response, NextFunction } from 'express'
import { saveRefreshToken } from '@/services/refresh-token.service'
import { RefreshTokenModel } from '@/models/refreash-token.model'
import { expiresInOptions } from '@/constants/token.constants'

export const register = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const body = await createUserSchema.parseAsync(request.body)
    const user = await getUserByEmail(body)
    if (user) {
      throw new ApiError('UNAUTHORIZED', 'user not found')
    }
    const newUser = await createUser(body)
    // todo: create jwt token
    const tokens = await newUser.createTokens()

    await saveRefreshToken(newUser.id, tokens.refreshToken)
    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: expiresInOptions.userAccessToken * 1000,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain:
        process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    })
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: expiresInOptions.userRefreshToken * 1000,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain:
        process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    })
    response.json({
      userId: newUser.id,
      ...tokens,
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const body = loginUserSchema.parse(request.body)
    const user = await getUserByEmail(body, { selectPassword: true })
    if (!user) {
      throw new ApiError('UNAUTHORIZED', 'user not found')
    }
    // compare the password
    const isMatch = await user.comparePassword(body.password)
    if (!isMatch) {
      throw new Error('Invalid password')
    }
    // todo: create jwt token
    const tokens = await user.createTokens()
    await saveRefreshToken(user.id, tokens.refreshToken)
    response.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: expiresInOptions.userAccessToken * 1000,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain:
        process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    })
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: expiresInOptions.userRefreshToken * 1000,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain:
        process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    })
    response.json({
      userId: user.id,
      ...tokens,
    })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    console.log('DEBUG: request.headers', request.headers)
    const { 'refresh-token': refreshToken } =
      await RefreshTokenHeaderSchema.parseAsync(request.headers)

    console.log('DEBUG: refreshToken', refreshToken)
    if (!refreshToken) {
      throw new ApiError('UNAUTHORIZED', 'Refresh token is required')
    }

    const { id, email } = await verifyToken(
      refreshToken,
      'userRefreshToken',
      userJWTPayloadSchema
    )

    console.log('DEBUG: refreshToken', refreshToken)
    const existingToken = await RefreshTokenModel.findOne({ refreshToken })
    if (!existingToken) {
      throw new ApiError('UNAUTHORIZED', 'refresh token not found')
    }

    console.log('DEBUG: existingToken', existingToken)
    // check if the existing user is the same as the user in the token
    if (existingToken.userId.toString() !== id.toString()) {
      throw new ApiError('UNAUTHORIZED', 'Invalid refresh token')
    }

    console.log('DEBUG: id', id)

    const newAccessToken = await createToken(
      { id, email },
      'userAccessToken',
      userJWTPayloadSchema
    )
    const newRefreshToken = await createToken(
      { id, email },
      'userRefreshToken',
      userJWTPayloadSchema
    )

    await saveRefreshToken(id.toString(), newRefreshToken)

    // delete the old refresh token
    // await RefreshTokenModel.deleteOne({ refreshToken })

    // set the refresh token to expire in 5 minutes to prevent data race condition
    await RefreshTokenModel.updateOne(
      { refreshToken },
      { expiresAt: new Date(Date.now() + 5 * 60 * 1000) }
    )

    response.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      maxAge: expiresInOptions.userAccessToken * 1000,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain:
        process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    })
    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: expiresInOptions.userRefreshToken * 1000,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain:
        process.env.NODE_ENV === 'production' ? 'your-domain.com' : undefined,
    })

    response.json({
      userId: id,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.log('DEBUG: error', error)
    next(error)
  }
}
