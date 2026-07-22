import { create } from 'zustand'
import { getSocket } from '@/api/realtime/realtimeBridge'
import type { MessageReaction } from '../lib/chat'

/*
  CLIENT state for the participant group chat. Message DELIVERY is now real: sendText
  emits `chat:send` over the socket and the server's `chat:message` echo lands in the
  React Query cache (see realtimeBridge) — this store no longer holds sent messages.
  What remains is genuinely client-only cosmetic (per the realtime-chat spec: reactions
  stay client-side, they don't touch the server): a session overlay of reactions.
*/
type ChatState = {
  /** Reactions added this session, keyed by message id (server or local). */
  reactionOverrides: Record<string, MessageReaction[]>
  /** Send a group message over the socket. groupId is accepted for call-site clarity
      but the server re-derives it from membership; only campId + text go on the wire. */
  sendText: (campId: string, groupId: string, text: string) => void
  /** Toggle my reaction on a message; `current` is its displayed reaction list. */
  toggleReaction: (messageId: string, emoji: string, current: MessageReaction[]) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  reactionOverrides: {},

  sendText: (campId, _groupId, text) => {
    const clean = text.trim()
    if (!clean) return
    // The server re-derives groupId from membership; channel is enough on the wire.
    getSocket()?.emit('chat:send', { campId, channel: 'group', text: clean })
  },

  toggleReaction: (messageId, emoji, current) => {
    const existing = current.find((r) => r.emoji === emoji)
    let next: MessageReaction[]
    if (!existing) {
      next = [...current, { emoji, count: 1, mine: true }]
    } else if (existing.mine) {
      const count = existing.count - 1
      next =
        count <= 0
          ? current.filter((r) => r.emoji !== emoji)
          : current.map((r) => (r.emoji === emoji ? { ...r, count, mine: false } : r))
    } else {
      next = current.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r))
    }
    set((s) => ({ reactionOverrides: { ...s.reactionOverrides, [messageId]: next } }))
  },

  reset: () => set({ reactionOverrides: {} }),
}))
