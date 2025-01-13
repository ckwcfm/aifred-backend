import { Schema, model, Model } from 'mongoose'
import { TUser, TUserMethods } from '@/types/user.types'
import bcrypt from 'bcrypt'
type UserModel = Model<TUser, {}, TUserMethods>
import { createToken } from '@/services/jwt.service'
import { userJWTPayloadSchema } from '@/schemas/user.schemas'

const UserSchema = new Schema<TUser, UserModel, TUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v
        ret.id = ret._id
        delete ret._id
      },
      virtuals: true,
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.__v
        ret.id = ret._id
        delete ret._id
      },
      virtuals: true,
    },
  }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

UserSchema.methods.createTokens = async function () {
  const accessToken = await createToken(
    this,
    'userAccessToken',
    userJWTPayloadSchema
  )
  const refreshToken = await createToken(
    this,
    'userRefreshToken',
    userJWTPayloadSchema
  )
  return { accessToken, refreshToken }
}
UserSchema.index({ createdAt: 1 })
export const User = model<TUser, UserModel>('User', UserSchema)
