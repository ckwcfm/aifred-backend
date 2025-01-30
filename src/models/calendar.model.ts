import { Schema, model } from 'mongoose'
import { TEvent } from '@/types/calendar.types'
import {
  eventRecurrenceSchema,
  eventStatusSchema,
} from '@/schemas/calendar.schemas'

const EventSchema = new Schema<TEvent>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: eventStatusSchema.options,
      default: eventStatusSchema.options[0], // 'pending' is the first option
      index: true,
    },
    recurrence: {
      type: String,
      enum: eventRecurrenceSchema.options,
      default: eventRecurrenceSchema.options[0], // 'none' is the first option
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      type: String,
    },
  } satisfies Record<keyof Omit<TEvent, 'createdAt' | 'updatedAt'>, any>,
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

// Index for querying events by date range
EventSchema.index({ startDate: 1, endDate: 1 })
EventSchema.index({ createdAt: 1 })

export const Event = model<TEvent>('Event', EventSchema)
