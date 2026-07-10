import { create } from 'zustand'
import type { ChatMessage, MessageReaction } from '../lib/chat'
import type { OrgChatChannelId } from '../api/services/orgChat.service'

/*
  CLIENT state — the messages the organizer sends THIS session, kept PER CHANNEL so
  the Organizers thread and the group thread never mix. The organizer twin of
  useChatStore, separate because the channels + coordinator lock are back-office
  concerns. When the backend lands, sendText/sendAttachment become the write-side
  POSTs; until then they're optimistic and local, and survive tab switches because
  the store outlives the screen.
*/
let seq = 0
const nextId = () => `org-local-${Date.now()}-${seq++}`
const nowHHMM = () => new Date().toTimeString().slice(0, 5)

// Fake the recipient's read receipt so ✓ → ✓✓ is visible without a backend.
const READ_DELAY_MS = 2200

/** Reactions added this session, keyed by message id — one map per channel. */
type ReactionOverrides = Record<OrgChatChannelId, Record<string, MessageReaction[]>>

type OrgChatState = {
  sent: Record<OrgChatChannelId, ChatMessage[]>
  reactionOverrides: ReactionOverrides
  /** The Organizers team's own photo (object URL) — kept here, NOT in useGroupStore,
      so it can't overwrite the participant group's shared identity photo. */
  teamPhoto: string | null
  setTeamPhoto: (file: File) => void
  sendText: (channel: OrgChatChannelId, text: string, replyTo?: ChatMessage['replyTo']) => void
  sendAttachment: (channel: OrgChatChannelId, file: File) => void
  /** Toggle my reaction on a message; `current` is its displayed reaction list. */
  toggleReaction: (
    channel: OrgChatChannelId,
    messageId: string,
    emoji: string,
    current: MessageReaction[],
  ) => void
  reset: () => void
}

const EMPTY: Record<OrgChatChannelId, ChatMessage[]> = { organizers: [], group: [] }
const EMPTY_REACTIONS: ReactionOverrides = { organizers: {}, group: {} }

export const useOrgChatStore = create<OrgChatState>((set) => {
  const push = (channel: OrgChatChannelId, message: ChatMessage) => {
    set((s) => ({ sent: { ...s.sent, [channel]: [...s.sent[channel], message] } }))
    setTimeout(() => {
      set((s) => ({
        sent: {
          ...s.sent,
          [channel]: s.sent[channel].map((m) =>
            m.id === message.id ? { ...m, status: 'read' } : m,
          ),
        },
      }))
    }, READ_DELAY_MS)
  }

  return {
    sent: { organizers: [], group: [] },
    reactionOverrides: { organizers: {}, group: {} },
    teamPhoto: null,

    // Object URL for a local preview; revoke the old one so repeated uploads don't leak.
    setTeamPhoto: (file) =>
      set((s) => {
        if (s.teamPhoto) URL.revokeObjectURL(s.teamPhoto)
        return { teamPhoto: URL.createObjectURL(file) }
      }),

    sendText: (channel, text, replyTo) => {
      const clean = text.trim()
      if (!clean) return
      push(channel, {
        id: nextId(),
        authorId: 'me',
        kind: 'text',
        text: clean,
        time: nowHHMM(),
        sentByMe: true,
        status: 'sent',
        replyTo,
      })
    },

    sendAttachment: (channel, file) => {
      const url = URL.createObjectURL(file) // local preview stands in for the upload
      push(channel, {
        id: nextId(),
        authorId: 'me',
        kind: file.type.startsWith('image/') ? 'image' : 'file',
        attachment: { name: file.name, url, size: file.size },
        time: nowHHMM(),
        sentByMe: true,
        status: 'sent',
      })
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
        next = current.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r,
        )
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
        return { sent: EMPTY, reactionOverrides: EMPTY_REACTIONS, teamPhoto: null }
      }),
  }
})
