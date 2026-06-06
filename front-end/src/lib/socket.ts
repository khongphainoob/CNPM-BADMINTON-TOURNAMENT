import { io } from 'socket.io-client'
import { apiBaseUrl } from './api-client'

const socketUrl = import.meta.env.VITE_SOCKET_URL || apiBaseUrl

export const socket = io(socketUrl, { autoConnect: false })
