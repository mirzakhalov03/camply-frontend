import { orgChatMock } from '../../lib/mockOrgChat'
import type { ChatMember, ChatMessage } from '../../lib/chat'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

/*
  The org-chat SERVICE — the backend boundary for the ORGANIZER chat's two channels:
    • 'organizers' — the organizer team (always available)
    • 'group'      — the coordinator's own group (coordinator-gated in the UI)
  Reuses ChatMember / ChatMessage from lib/chat (types are cheap to share; state is
  not — sends live in useOrgChatStore). Today list() returns the mock; flipping to
  the real API touches only list(). No React here.
*/
export type OrgChatChannelId = 'organizers' | 'group'

export type OrgChatChannel = {
  id: OrgChatChannelId
  /** Channel title. Empty for 'organizers' (the UI uses the translated label). */
  title: string
  emoji: string
  members: ChatMember[]
  messages: ChatMessage[]
  onlineCount: number
}

export type OrgChat = {
  organizers: OrgChatChannel
  group: OrgChatChannel
}

export const orgChatService = {
  get: async (): Promise<OrgChat> => {
    // return (await axiosInstance.get<OrgChat>('/organizer/chat')).data
    return orgChatMock
  },
}
