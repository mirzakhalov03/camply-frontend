import { create } from 'zustand'
import type { ChatMessage, MessageReaction } from '../lib/chat'

/*
  CLIENT state — the messages the participant sends THIS session and an overlay of
  reactions the user adds this session. Kept separate from server history (useChat)
  exactly like useProfileStore is separate from useCampHome: this store is what
  becomes the write-side API calls when the backend lands —
    • sendText / sendAttachment → POST /groups/:id/messages
    • toggleReaction            → POST/DELETE /messages/:id/reactions
  Until then it's optimistic and local, and it persists across tab switches because
  the store outlives the ChatScreen.

  The group photo used to live here too, but it's GROUP identity shared with the
  Ranks screen — so it moved to useGroupStore. See there.

  Author identity for sent messages ('me') is resolved in the UI from
  useProfileStore, so the store only carries the message payload.
*/

let seq = 0
const nextId = () => `local-${Date.now()}-${seq++}`
const nowHHMM = () => new Date().toTimeString().slice(0, 5)

// How long until a sent message is "read" by the recipient. With no backend, we
// fake the read receipt so the ✓ → ✓✓ transition is visible. One place to change.
const READ_DELAY_MS = 2200

type ChatState = {
  sent: ChatMessage[]
  /** Reactions added this session, keyed by message id (server or local). */
  reactionOverrides: Record<string, MessageReaction[]>
  sendText: (text: string, replyTo?: ChatMessage['replyTo']) => void
  sendAttachment: (file: File) => void
  /** Toggle my reaction on a message; `current` is its displayed reaction list. */
  toggleReaction: (messageId: string, emoji: string, current: MessageReaction[]) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => {
  // Append a message as 'sent', then flip it to 'read' after a short delay so the
  // ticks animate from ✓ to ✓✓. Shared by sendText and sendAttachment.
  const push = (message: ChatMessage) => {
    set((s) => ({ sent: [...s.sent, message] }))
    setTimeout(() => {
      set((s) => ({
        sent: s.sent.map((m) => (m.id === message.id ? { ...m, status: 'read' } : m)),
      }))
    }, READ_DELAY_MS)
  }

  return {
    sent: [],
    reactionOverrides: {},

    sendText: (text, replyTo) => {
      const clean = text.trim()
      if (!clean) return
      push({
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

    sendAttachment: (file) => {
      // Local preview only — a browser object URL stands in for the uploaded URL.
      const url = URL.createObjectURL(file)
      const kind = file.type.startsWith('image/') ? 'image' : 'file'
      push({
        id: nextId(),
        authorId: 'me',
        kind,
        attachment: { name: file.name, url, size: file.size },
        time: nowHHMM(),
        sentByMe: true,
        status: 'sent',
      })
    },

    toggleReaction: (messageId, emoji, current) => {
      const existing = current.find((r) => r.emoji === emoji)
      let next: MessageReaction[]
      if (!existing) {
        // First time anyone uses this emoji here → add it as mine.
        next = [...current, { emoji, count: 1, mine: true }]
      } else if (existing.mine) {
        // Remove my reaction; drop the chip entirely if the count hits zero.
        const count = existing.count - 1
        next =
          count <= 0
            ? current.filter((r) => r.emoji !== emoji)
            : current.map((r) => (r.emoji === emoji ? { ...r, count, mine: false } : r))
      } else {
        // Others already used it → add me on top.
        next = current.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r,
        )
      }
      set((s) => ({ reactionOverrides: { ...s.reactionOverrides, [messageId]: next } }))
    },

    reset: () => set({ sent: [], reactionOverrides: {} }),
  }
})
