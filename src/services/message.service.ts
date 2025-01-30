import { Message } from '@/models/message.model'
import { TMessageToRoom } from '@/types/message.type'

export const createMessageForRoom = async (data: TMessageToRoom) => {
  const message = new Message({
    ...data,
  })
  await message.save()
  return message
}
