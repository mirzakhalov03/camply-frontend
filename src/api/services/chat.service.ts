import { axiosInstance } from '../axiosInstance'
import type { ChatMember, ChatMessage } from '@/lib/chat'

export type GroupHistory = {
  groupId: string | null
  members: ChatMember[]
  messages: ChatMessage[]
}
export type OrgHistory = {
  members: ChatMember[]
  messages: ChatMessage[]
}
export type MyRole = { role: string | null; groupId: string | null }

/*
  The backend boundary for realtime chat's HISTORY load (sending happens over the
  socket, see realtimeBridge). Group + organizers channels each return their room's
  members[] so the UI can resolve a message's author from its authorId.
*/
export const chatService = {
  groupHistory: async (campId: string): Promise<GroupHistory> =>
    (await axiosInstance.get<GroupHistory>(`/camps/${campId}/chat/group/messages`)).data,
  organizersHistory: async (campId: string): Promise<OrgHistory> =>
    (await axiosInstance.get<OrgHistory>(`/camps/${campId}/chat/organizers/messages`)).data,
  myRole: async (campId: string): Promise<MyRole> =>
    (await axiosInstance.get<MyRole>(`/camps/${campId}/my-role`)).data,
}
