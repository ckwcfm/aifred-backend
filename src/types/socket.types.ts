import { DisconnectReason, Socket, Server } from 'socket.io'
import { TMessage, TMessageToRoom } from './message.type'

export interface ServerToClientEvents {
  message: (message: TMessage) => void
  roomMessage: (message: TMessage) => void
  roomJoined: (data: RoomEvent) => void
  roomLeft: (data: RoomEvent) => void
  typing: (data: TypingStatus) => void
  error: (data: { message: string }) => void
}

export interface ClientToServerEvents {
  message: (message: string) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  messageToRoom: (data: TMessageToRoom) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

export type TypedIOServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>

export interface TypingStatus {
  isTyping: boolean
  senderName: string
}

export interface RoomEvent {
  message: string
}
