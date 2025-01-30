import { DisconnectReason } from 'socket.io'
import { ObjectId } from 'mongodb'
import { createMessageForRoom } from '@/services/message.service'
import { invokeAgent } from '@/ais/agent'
import { messageToRoomSchema } from '@/schemas/message.schmas'
import { TMessageToRoom } from '@/types/message.type'
import { TypedSocket, TypedIOServer } from '@/types/socket.types'

export const handleDisconnect =
  (socket: TypedSocket) => (reason: DisconnectReason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`)
  }

export const handleMessage =
  (socket: TypedSocket, io: TypedIOServer) => (message: string) => {
    console.log('Received message:', message)
    const userId = socket.data.userId

    // * Fake response for testing purposes only
    io.emit('message', {
      content: message,
      randomId: crypto.randomUUID(),
      contentType: 'text',
      roomId: new ObjectId(userId),
      senderId: new ObjectId('000000000000000000000001'),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

export const handleJoinRoom =
  (socket: TypedSocket, io: TypedIOServer) => (roomId: string) => {
    socket.join(roomId)
    console.log(`User joined room: ${roomId}`)
    io.to(roomId).emit('roomJoined', {
      message: 'Welcome to the room!',
    })
  }

export const handleLeaveRoom =
  (socket: TypedSocket, io: TypedIOServer) => (roomId: string) => {
    socket.leave(roomId)
    console.log(`User left room: ${roomId}`)
    io.to(roomId).emit('roomLeft', {
      message: 'You have left the room.',
    })
  }

export const handleMessageToRoom =
  (socket: TypedSocket, io: TypedIOServer) => async (data: TMessageToRoom) => {
    try {
      const message = messageToRoomSchema.parse(data)
      const roomId = message.roomId

      const newMessage = await createMessageForRoom({
        ...message,
        status: 'confirmed',
      })

      io.to(roomId.toString()).emit('roomMessage', newMessage)
      await handleAIResponse(io, roomId.toString())
    } catch (error) {
      console.error('Error handling room message:', error)
      socket.emit('error', { message: 'Failed to process message' })
    }
  }

const emitTypingStatus = (
  io: TypedIOServer,
  roomId: string,
  isTyping: boolean
) => {
  io.to(roomId).emit('typing', {
    isTyping,
    senderName: 'Aifred',
  })
}

const handleAIResponse = async (io: TypedIOServer, roomId: string) => {
  try {
    emitTypingStatus(io, roomId, true)
    const agentReply = await invokeAgent('', roomId)

    const reply = await createMessageForRoom({
      contentType: agentReply.contentType,
      content: agentReply.content,
      randomId: crypto.randomUUID(),
      roomId: new ObjectId(roomId),
      senderId: new ObjectId('000000000000000000000001'),
      status: 'confirmed',
    })

    emitTypingStatus(io, roomId, false)
    io.to(roomId).emit('roomMessage', reply)
  } catch (error) {
    console.error('Error generating AI response:', error)
    emitTypingStatus(io, roomId, false)
  }
}
