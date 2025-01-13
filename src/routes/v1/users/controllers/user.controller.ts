import { getUserById } from '@/services/user.service'
import { Request, Response, NextFunction } from 'express'

export const me = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const user = await getUserById({ id: response.locals.user.id })
    response.json(user)
  } catch (error) {
    next(error)
  }
}
