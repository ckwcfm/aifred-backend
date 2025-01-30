import { Schema, model } from 'mongoose'
import { TMessage } from '@/types/message.type'
import { messageContentTypes, messageStatuses } from '@/schemas/message.schmas'

const MessageSchema = new Schema<TMessage>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: messageContentTypes,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    randomId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: messageStatuses,
      default: messageStatuses[0],
    },
  } satisfies Record<keyof Omit<TMessage, 'createdAt' | 'updatedAt'>, any>,
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

MessageSchema.index({ createdAt: 1 })

export const Message = model<TMessage>('Message', MessageSchema)
