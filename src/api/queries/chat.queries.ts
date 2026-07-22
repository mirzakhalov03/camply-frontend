import { useQuery } from '@tanstack/react-query'
import { chatService } from '../services/chat.service'
import { campKeys } from '../queryKeys'

/*
  The group chat: participants AND the group's coordinator share this exact cache
  entry (same room server-side). Realtime chat:message appends here via setQueryData.
*/
export function useChat(campId: string, groupId: string) {
  return useQuery({
    queryKey: campKeys.chat(campId, groupId),
    queryFn: () => chatService.groupHistory(campId),
    enabled: Boolean(campId) && Boolean(groupId),
  })
}

/** The organizers channel — camp-wide, organizer-tier only. */
export function useOrgChat(campId: string) {
  return useQuery({
    queryKey: campKeys.chatOrganizers(campId),
    queryFn: () => chatService.organizersHistory(campId),
    enabled: Boolean(campId),
  })
}

/** The caller's own role + group in this camp (server-known coordinator gating). */
export function useMyRole(campId: string) {
  return useQuery({
    queryKey: campKeys.myRole(campId),
    queryFn: () => chatService.myRole(campId),
    enabled: Boolean(campId),
  })
}
