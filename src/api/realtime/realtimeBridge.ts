import { io, type Socket } from 'socket.io-client'
import { queryClient } from '@/api/queryClient'
import { campKeys } from '../queryKeys'
import { useAuthStore } from '@/store/useAuthStore'
import { useChatUnreadStore, roomKey } from '@/store/useChatUnreadStore'
import type { ChatMessage, MessageReaction } from '@/lib/chat'

/*
  The realtime BRIDGE — the ONE socket, routing server events into the SAME React
  Query cache the UI reads. Auth rides the httpOnly camply_sid cookie on the
  handshake (same-origin via the Vite /socket.io proxy). Sending is the store
  emitting chat:send via getSocket(); the server's chat:message echo lands here.
*/

type ChatMessageEvent = {
  channel: 'group' | 'organizers'
  groupId: string | null
  message: ChatMessage
}

type ChatReactionEvent = {
  channel: 'group' | 'organizers'
  groupId: string | null
  messageId: string
  reactions: { emoji: string; count: number }[]
}

type ChatReadEvent = {
  channel: 'group' | 'organizers'
  groupId: string | null
  userId: string
  lastReadAt: string
}

// Same-origin by default (Vite proxies /socket.io in dev). Override with VITE_WS_URL.
const WS_URL = import.meta.env.VITE_WS_URL as string | undefined

let socket: Socket | null = null
let currentCampId: string | null = null

// The room the user is actively viewing (set by the chat screens); its messages don't
// count as unread. null = not on a chat screen.
let activeRoomKey: string | null = null
export function setActiveRoom(key: string | null) {
  activeRoomKey = key
}

/** The cache key for a room's history, or null if we're not connected to a camp. */
function keyFor(channel: 'group' | 'organizers', groupId: string | null) {
  if (!currentCampId) return null
  return channel === 'group' && groupId
    ? campKeys.chat(currentCampId, groupId)
    : campKeys.chatOrganizers(currentCampId)
}

/** Append a message into a room's cached history, deduped by id. */
function appendMessage(key: readonly unknown[], message: ChatMessage) {
  queryClient.setQueryData(key, (prev: unknown) => {
    const data = (prev ?? { messages: [] }) as { messages?: ChatMessage[]; [k: string]: unknown }
    const messages = Array.isArray(data.messages) ? data.messages : []
    if (messages.some((m) => m.id === message.id)) return data
    return { ...data, messages: [...messages, message] }
  })
}

/** Replace a message's reaction counts from the server, preserving my local `mine`. */
function applyReaction(key: readonly unknown[], evt: ChatReactionEvent) {
  queryClient.setQueryData(key, (prev: unknown) => {
    const data = prev as { messages?: ChatMessage[] } | undefined
    if (!data?.messages) return data
    const messages = data.messages.map((m) => {
      if (m.id !== evt.messageId) return m
      const prevMine = new Set((m.reactions ?? []).filter((r) => r.mine).map((r) => r.emoji))
      const reactions: MessageReaction[] = evt.reactions.map((r) => ({
        emoji: r.emoji,
        count: r.count,
        mine: prevMine.has(r.emoji),
      }))
      return { ...m, reactions }
    })
    return { ...data, messages }
  })
}

export function connectRealtime(campId: string) {
  // Already connected to this camp — no-op (StrictMode-safe: a second mount with the
  // same campId doesn't churn the live socket).
  if (socket && currentCampId === campId) return
  if (socket) disconnectRealtime()
  currentCampId = campId

  socket = io(WS_URL ?? '', { withCredentials: true })

  // Fires on first connect AND every reconnect — re-join the room each time so a
  // dropped connection self-heals without a page refresh.
  socket.on('connect', () => {
    socket?.emit('chat:connectCamp', { campId })
  })

  socket.on('chat:message', (evt: ChatMessageEvent) => {
    const key = keyFor(evt.channel, evt.groupId)
    if (key) appendMessage(key, evt.message)
    // Bump the unread badge for a room the user isn't viewing (and never for my own).
    const rk = roomKey(evt.channel, evt.groupId)
    const myId = useAuthStore.getState().user?.id
    if (rk !== activeRoomKey && evt.message.authorId !== myId) {
      useChatUnreadStore.getState().bump(rk)
    }
  })

  socket.on(
    'chat:unread',
    (evt: {
      rooms: { channel: 'group' | 'organizers'; groupId: string | null; count: number }[]
    }) => {
      useChatUnreadStore.getState().seed(evt.rooms)
    },
  )

  socket.on('chat:reaction', (evt: ChatReactionEvent) => {
    const key = keyFor(evt.channel, evt.groupId)
    if (key) applyReaction(key, evt)
  })

  socket.on('chat:read', (evt: ChatReadEvent) => {
    const myId = useAuthStore.getState().user?.id
    if (evt.userId === myId) return // my own read never advances "others"
    const key = keyFor(evt.channel, evt.groupId)
    if (!key) return
    queryClient.setQueryData(key, (prev: unknown) => {
      const data = prev as { othersLastReadAt?: string | null } | undefined
      if (!data) return data
      const current = data.othersLastReadAt ?? ''
      return evt.lastReadAt > current ? { ...data, othersLastReadAt: evt.lastReadAt } : data
    })
  })
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
