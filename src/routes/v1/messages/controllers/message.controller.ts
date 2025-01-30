import { Request, Response } from 'express'
import { Message } from '@/models/message.model'

export const roomMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params
  console.log('DEBUG: roomId', roomId)
  const messages = await Message.find({ roomId }).sort({ createdAt: -1 })

  console.log(messages)

  res.json(messages.reverse())
}
