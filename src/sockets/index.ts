import { Server as HTTPServer } from 'http'
import { Socket } from 'socket.io'
import { createSocketServer } from './config'
import { authMiddleware } from './middleware'
import {
  handleDisconnect,
  handleMessage,
  handleJoinRoom,
  handleLeaveRoom,
  handleMessageToRoom,
} from './handlers'

/**
 * Initializes and starts a Socket.IO server
 *
 * @param httpServer - The HTTP server instance to attach Socket.IO to
 * @returns The configured Socket.IO server instance
 */
export const initializeSocketServer = (httpServer: HTTPServer) => {
  const io = createSocketServer(httpServer)

  io.use(authMiddleware)

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id)

    socket.on('disconnect', handleDisconnect(socket))
    socket.on('message', handleMessage(socket, io))
    socket.on('joinRoom', handleJoinRoom(socket, io))
    socket.on('leaveRoom', handleLeaveRoom(socket, io))
    socket.on('messageToRoom', handleMessageToRoom(socket, io))
  })

  // Handle server-level errors
  io.engine.on('error', (error: Error) => {
    console.error('Socket error:', error)
  })

  return io
}
