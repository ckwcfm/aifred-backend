import { Schema, model } from 'mongoose'
import { TRefreshToken } from '@/types/refresh-token.types'
import { expiresInOptions } from '@/constants/token.constants'

// This type ensures all fields from TRefreshToken must be implemented
const RefreshTokenSchema = new Schema<TRefreshToken>(
  {
    refreshToken: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiryAt: {
      type: Date,
      required: true,
      default: () =>
        new Date(Date.now() + expiresInOptions.userRefreshToken * 1000),
    },
  } satisfies Record<keyof TRefreshToken, any>,
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v
        ret.id = ret._id
        delete ret._id
      },
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.__v
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

RefreshTokenSchema.index({ createdAt: 1 })
RefreshTokenSchema.index({ expiryAt: 1 }, { expireAfterSeconds: 0 })

export const RefreshTokenModel = model<TRefreshToken>(
  'RefreshToken',
  RefreshTokenSchema
)
