import { create } from 'zustand'
import { getSocket } from '@/api/realtime/realtimeBridge'
import type { MessageReaction } from '../lib/chat'

/*
  CLIENT state for the organizer chat's two channels. Delivery is real: sendText emits
  `chat:send` over the socket (the server re-derives the group for the 'group' channel)
  and the `chat:message` echo lands in the query cache. This store keeps only the
  client-only cosmetics the realtime-chat spec leaves alone: a per-channel reaction
  overlay and the Organizers team's local identity photo.
*/
export type OrgChatChannelId = 'organizers' | 'group'

type ReactionOverrides = Record<OrgChatChannelId, Record<string, MessageReaction[]>>

type OrgChatState = {
  reactionOverrides: ReactionOverrides
  /** The Organizers team's own photo (object URL) — local, org-chat-only. */
  teamPhoto: string | null
  setTeamPhoto: (file: File) => void
  /** Send a message over the socket on the given channel. */
  sendText: (campId: string, channel: OrgChatChannelId, text: string) => void
  toggleReaction: (
    channel: OrgChatChannelId,
    messageId: string,
    emoji: string,
    current: MessageReaction[],
  ) => void
  reset: () => void
}

const EMPTY_REACTIONS: ReactionOverrides = { organizers: {}, group: {} }

export const useOrgChatStore = create<OrgChatState>((set) => ({
  reactionOverrides: { organizers: {}, group: {} },
  teamPhoto: null,

  // Object URL for a local preview; revoke the old one so repeated uploads don't leak.
  setTeamPhoto: (file) =>
    set((s) => {
      if (s.teamPhoto) URL.revokeObjectURL(s.teamPhoto)
      return { teamPhoto: URL.createObjectURL(file) }
    }),

  sendText: (campId, channel, text) => {
    const clean = text.trim()
    if (!clean) return
    getSocket()?.emit('chat:send', { campId, channel, text: clean })
  },

  toggleReaction: (channel, messageId, emoji, current) => {
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
    set((s) => ({
      reactionOverrides: {
        ...s.reactionOverrides,
        [channel]: { ...s.reactionOverrides[channel], [messageId]: next },
      },
    }))
  },

  reset: () =>
    set((s) => {
      if (s.teamPhoto) URL.revokeObjectURL(s.teamPhoto)
      return { reactionOverrides: EMPTY_REACTIONS, teamPhoto: null }
    }),
}))
