import {
  messageContentTypesSchema,
  messageSchema,
  messageStatusesSchema,
  messageToRoomSchema,
} from '@/schemas/message.schmas'
import { z } from 'zod'

export type TMessageContentType = z.infer<typeof messageContentTypesSchema>

export type TMessage = z.infer<typeof messageSchema>

export type TMessageToRoom = z.infer<typeof messageToRoomSchema>

export type TMessageStatus = z.infer<typeof messageStatusesSchema>
