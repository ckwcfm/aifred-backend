import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { createMessageForRoom } from '@/services/message.service'
import {
  TMessage,
  TMessageContentType,
  TMessageToRoom,
} from '@/types/message.type'
import { messageToRoomSchema } from '@/schemas/message.schmas'
import { ObjectId } from 'mongodb'
import { invokeAgent } from '@/ais/agent'
import { userAccessTokenPayload } from '@/schemas/token.schemas'
import { verifyToken } from '@/services/jwt.service'
import { ApiError } from '@/utils/error.utils'

/**
 * Initializes and starts a Socket.IO server
 *
 * @param httpServer - The HTTP server instance to attach Socket.IO to
 * @returns The configured Socket.IO server instance
 */
export const initializeSocketServer = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? 'https://www.example.com'
          : ['http://localhost:5173'],
    },
  })

  io.use(async (socket, next) => {
    try {
      const { token } = socket.handshake.auth
      console.log('DEBUG: (socketIndex/sendMessageToRoom) - line 30', token)
      const isUser = await verifyToken(
        token,
        'userAccessToken',
        userAccessTokenPayload
      )
      console.log('DEBUG: (socketIndex/sendMessageToRoom) - line 30', isUser)
      if (!isUser) {
        next(new ApiError('UNAUTHORIZED', 'Unauthorized'))
      }
      next()
    } catch (error) {
      next(error instanceof Error ? error : new Error('Unknown error occurred'))
    }
  })

  io.on('error', (error) => {
    console.error('DEBUG: (socketIndex/sendMessageToRoom) - line 71', error)
  })

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })

    socket.on('message', (message) => {
      console.log('Received message:', message)
      io.emit('message', message)
    })

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      console.log(`User joined room: ${roomId}`)
      io.to(roomId).emit('roomJoined', { message: 'Welcome to the room!' })
    })

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId)
      console.log(`User left room: ${roomId}`)
      io.to(roomId).emit('roomLeft', { message: 'You have left the room.' })
    })

    // Handle message event sent to a specific room
    socket.on('messageToRoom', async (data: TMessageToRoom) => {
      try {
        const message = messageToRoomSchema.parse(data)
        const roomId = message.roomId
        console.log('DEBUG: (socketIndex/sendMessageToRoom) - line 46', message)
        const newMessage = await createMessageForRoom({
          ...message,
          status: 'confirmed',
        })
        io.to(roomId.toString()).emit('roomMessage', newMessage)
        io.to(roomId.toString()).emit('typing', {
          isTyping: true,
          senderName: 'Aifred',
        })
        const agentReply = await invokeAgent(message.content, `${roomId}`)

        const replay = await createMessageForRoom({
          contentType: agentReply.contentType,
          content: agentReply.content as string,
          randomId: crypto.randomUUID(),
          roomId,
          senderId: new ObjectId('000000000000000000000001'), // fake sender id for AI
          status: 'confirmed',
        })
        io.to(roomId.toString()).emit('typing', {
          isTyping: false,
          senderName: 'Aifred',
        })
        io.to(roomId.toString()).emit('roomMessage', replay)
      } catch (error) {
        console.error(
          'DEBUG: (socketIndex/sendMessageToRoom) - line 110',
          error
        )
      }
    })

    socket.on('error', (error) => {
      console.error('DEBUG: (socketIndex/sendMessageToRoom) - line 118', error)
    })
  })

  console.log('Socket.IO server initialized')
}

function createMockReplyMessage(message: string): TMessageToRoom {
  return {
    roomId: new ObjectId(),
    senderId: new ObjectId('000000000000000000000001'),
    contentType: 'text',
    randomId: crypto.randomUUID(),
    content: message,
    status: 'confirmed',
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
