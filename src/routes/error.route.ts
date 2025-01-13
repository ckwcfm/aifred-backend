import { z } from 'zod'
import { ApiError } from '@/utils/error.utils'
import {
  type Request,
  type Response,
  type NextFunction,
  ErrorRequestHandler,
} from 'express'
import mongoose from 'mongoose'

export const errorRoute: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('sdfsfjsldfj')
  console.log(err)

  if (err instanceof z.ZodError) {
    res.status(400).json(
      err.errors.map((error) => ({
        message: error.message,
        path: error.path.join('.'),
      }))
    )
  } else if (err instanceof ApiError) {
    res.status(err.status).json({
      message: err.message,
    })
  } else if (err instanceof mongoose.mongo.MongoError) {
    res.status(400).json({
      message: err.message,
    })
  } else if (err instanceof Error) {
    res.status(400).json({
      message: err.message,
    })
  } else {
    res.status(500).json({
      message: 'Internal Server Error',
    })
  }
}
