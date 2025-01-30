import { Schema, model } from 'mongoose'
import { TRSA } from '@/types/rsa.types'
import { addDays } from 'date-fns'
import { RSAType } from '@/schemas/rsa.schemas'

const RSASchema = new Schema<TRSA>(
  {
    publicKey: {
      type: String,
      required: true,
      index: true,
    },
    privateKey: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: RSAType,
      required: true,
      index: true,
    },
    deprecatedAt: {
      type: Date,
      required: true,
      default: () => addDays(new Date(), 30),
      index: true,
    },
    expireAt: {
      type: Date,
      required: true,
      default: () => addDays(new Date(), 60),
    },
  } satisfies Record<keyof Omit<TRSA, 'createdAt' | 'updatedAt'>, any>,
  {
    timestamps: true,
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

// auto remove expired keys
RSASchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

export const RSA = model<TRSA>('RSA', RSASchema)
