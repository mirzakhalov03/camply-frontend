import { create } from 'zustand'
import { getSocket } from '@/api/realtime/realtimeBridge'

/*
  CLIENT state for the organizer chat's two channels. Delivery + reactions are real
  and SERVER-owned in the query cache: sendText emits `chat:send` and reactions go
  through useChatStore.toggleReaction (one shared reaction path, both surfaces). This
  store keeps only the genuinely client-only bit: the Organizers team's local photo.
*/
export type OrgChatChannelId = 'organizers' | 'group'

type OrgChatState = {
  /** The Organizers team's own photo (object URL) — local, org-chat-only. */
  teamPhoto: string | null
  setTeamPhoto: (file: File) => void
  /** Send a message over the socket on the given channel. */
  sendText: (campId: string, channel: OrgChatChannelId, text: string) => void
  reset: () => void
}

export const useOrgChatStore = create<OrgChatState>((set) => ({
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

  reset: () =>
    set((s) => {
      if (s.teamPhoto) URL.revokeObjectURL(s.teamPhoto)
      return { teamPhoto: null }
    }),
}))
