import { create } from 'zustand'
import type { ChatMessage } from '../lib/chat'
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

type OrgChatState = {
  sent: Record<OrgChatChannelId, ChatMessage[]>
  sendText: (channel: OrgChatChannelId, text: string) => void
  sendAttachment: (channel: OrgChatChannelId, file: File) => void
  reset: () => void
}

const EMPTY: Record<OrgChatChannelId, ChatMessage[]> = { organizers: [], group: [] }

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

    sendText: (channel, text) => {
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

    reset: () => set({ sent: EMPTY }),
  }
})
