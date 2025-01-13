import {
  createUserSchema,
  loginUserSchema,
  userJWTPayloadSchema,
} from '@/schemas/user.schemas'
import { createToken } from '@/services/jwt.service'
import { createUser, getUserByEmail } from '@/services/user.service'
import { Request, Response, NextFunction } from 'express'

export const register = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const body = await createUserSchema.parseAsync(request.body)
    const user = await getUserByEmail(body)
    if (user) {
      throw new Error('User already exists')
    }
    const newUser = await createUser(body)
    // todo: create jwt token
    const tokens = await newUser.createTokens()

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
    const user = await getUserByEmail(body)
    if (!user) {
      throw new Error('User not found')
    }
    // compare the password
    const isMatch = await user.comparePassword(body.password)
    if (!isMatch) {
      throw new Error('Invalid password')
    }
    // todo: create jwt token
    const tokens = await user.createTokens()
    response.json({
      userId: user.id,
      ...tokens,
    })
  } catch (error) {
    next(error)
  }
}
