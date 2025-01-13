import mongoose from 'mongoose'
import { z } from 'zod'

// 這是一個自訂架構，用於檢查該值是否是有效的 ObjectId
export const MongoObjectIdSchema = () =>
  z.custom<mongoose.Types.ObjectId>((value) => {
    try {
      return mongoose.isValidObjectId(value)
    } catch (error) {
      throw new Error('Invalid ObjectId')
    }
  })
