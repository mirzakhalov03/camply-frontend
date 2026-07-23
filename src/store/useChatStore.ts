import { create } from 'zustand'
import { getSocket } from '@/api/realtime/realtimeBridge'
import { queryClient } from '@/api/queryClient'
import { campKeys } from '@/api/queryKeys'
import type { ChatMessage, MessageReaction } from '@/lib/chat'

/*
  CLIENT actions for the participant group chat. Message + reaction state are SERVER
  truth in the React Query cache (see realtimeBridge); this store only holds the emit
  helpers. Reactions: emit chat:react, optimistically flip the cached message so the
  tap feels instant, and let the chat:reaction echo reconcile the authoritative counts.
  Shared by the organizer chat too (it passes channel: 'organizers' | 'group').
*/
type ChatState = {
  sendText: (campId: string, groupId: string, text: string) => void
  toggleReaction: (
    campId: string,
    channel: 'group' | 'organizers',
    groupId: string | null,
    messageId: string,
    emoji: string,
  ) => void
}

/** Local optimistic toggle of `current` for my tap (mirrors the server's toggle). */
function optimistic(current: MessageReaction[], emoji: string): MessageReaction[] {
  const existing = current.find((r) => r.emoji === emoji)
  if (!existing) return [...current, { emoji, count: 1, mine: true }]
  if (existing.mine) {
    const count = existing.count - 1
    return count <= 0
      ? current.filter((r) => r.emoji !== emoji)
      : current.map((r) => (r.emoji === emoji ? { ...r, count, mine: false } : r))
  }
  return current.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r))
}

export const useChatStore = create<ChatState>(() => ({
  sendText: (campId, _groupId, text) => {
    const clean = text.trim()
    if (!clean) return
    // The server re-derives groupId from membership; channel is enough on the wire.
    getSocket()?.emit('chat:send', { campId, channel: 'group', text: clean })
  },

  // The caller passes the tapped `emoji`; the message's current reactions are read
  // from the cache (the source of truth).
  toggleReaction: (campId, channel, groupId, messageId, emoji) => {
    const key =
      channel === 'group' && groupId
        ? campKeys.chat(campId, groupId)
        : campKeys.chatOrganizers(campId)
    queryClient.setQueryData(key, (prev: unknown) => {
      const data = prev as { messages?: ChatMessage[] } | undefined
      if (!data?.messages) return data
      return {
        ...data,
        messages: data.messages.map((m) =>
          m.id === messageId ? { ...m, reactions: optimistic(m.reactions ?? [], emoji) } : m,
        ),
      }
    })
    getSocket()?.emit('chat:react', { campId, channel, messageId, emoji })
  },
}))
