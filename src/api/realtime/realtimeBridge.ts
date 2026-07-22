import { io, type Socket } from 'socket.io-client'
import { queryClient } from '@/api/queryClient'
import { campKeys } from '../queryKeys'
import type { ChatMessage } from '@/lib/chat'

/*
  The realtime BRIDGE — the ONE socket, routing server events into the SAME React
  Query cache the UI reads (append for chat). No parallel state store. Auth rides the
  httpOnly camply_sid cookie on the handshake (same-origin via the Vite /socket.io
  proxy), so no token in JS. Sending is the store emitting chat:send via getSocket();
  the server's chat:message echo lands back here as the single source of truth.
*/

type ChatMessageEvent = {
  channel: 'group' | 'organizers'
  groupId: string | null
  message: ChatMessage
}

// Same-origin by default (Vite proxies /socket.io in dev). Override with VITE_WS_URL.
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined

let socket: Socket | null = null
let currentCampId: string | null = null

/** Append a message into a room's cached history, deduped by id. */
function appendMessage(key: readonly unknown[], message: ChatMessage) {
  queryClient.setQueryData(key, (prev: unknown) => {
    const data = (prev ?? { messages: [] }) as { messages?: ChatMessage[]; [k: string]: unknown }
    const messages = Array.isArray(data.messages) ? data.messages : []
    if (messages.some((m) => m.id === message.id)) return data
    return { ...data, messages: [...messages, message] }
  })
}

export function connectRealtime(campId: string) {
  if (socket && currentCampId === campId) return
  if (socket) disconnectRealtime()
  currentCampId = campId

  socket = io(WS_URL ?? '', { withCredentials: true })

  socket.on('connect', () => {
    socket?.emit('chat:connectCamp', { campId })
  })

  socket.on('chat:message', (evt: ChatMessageEvent) => {
    if (!currentCampId) return
    const key =
      evt.channel === 'group' && evt.groupId
        ? campKeys.chat(currentCampId, evt.groupId)
        : campKeys.chatOrganizers(currentCampId)
    appendMessage(key, evt.message)
  })

  // Presence is best-effort UI sugar; wire an onlineCount store later if desired.
  // socket.on('chat:presence', (p) => { ... })
}

export function disconnectRealtime() {
  socket?.disconnect()
  socket = null
  currentCampId = null
}

/** The live socket, so the chat stores can emit chat:send. Null until connected. */
export function getSocket(): Socket | null {
  return socket
}
