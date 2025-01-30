import { Server as HTTPServer } from 'http'
import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '@/types/socket.types'

export const createSocketServer = (httpServer: HTTPServer) => {
  return new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: getCorsOrigin(),
    },
  })
}

const getCorsOrigin = (): string[] | string => {
  return process.env.NODE_ENV === 'production'
    ? 'https://www.example.com'
    : ['http://localhost:5173']
}
