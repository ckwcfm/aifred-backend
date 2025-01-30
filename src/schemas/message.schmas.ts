import { z } from 'zod'
import { MongoObjectIdSchema } from './mongoos.schemas'

export const messageContentTypes = [
  'text',
  'image',
  'audio',
  'video',
  'form',
] as const

export const messageContentTypesSchema = z.enum(messageContentTypes)

export const messageStatuses = ['pending', 'confirmed'] as const

export const messageStatusesSchema = z.enum(messageStatuses)

export const messageSchema = z.object({
  roomId: MongoObjectIdSchema(),
  senderId: MongoObjectIdSchema(),
  contentType: messageContentTypesSchema.default('text'),
  randomId: z.string(),
  content: z.string(),
  status: messageStatusesSchema.default('pending'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const messageToRoomSchema = messageSchema.pick({
  roomId: true,
  content: true,
  contentType: true,
  senderId: true,
  randomId: true,
  status: true,
})
