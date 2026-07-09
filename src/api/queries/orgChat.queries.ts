import { useQuery } from '@tanstack/react-query'
import { orgChatService } from '../services/orgChat.service'
import { organizerKeys } from '../queryKeys'

/*
  The org-chat QUERY — the React layer over orgChatService. Keyed from the registry
  (organizerKeys.orgChat) so the header, rail, thread, and members sheet share one
  fetch, and a future realtime "orgChat:message" event can invalidate it.
*/
export function useOrgChat() {
  return useQuery({ queryKey: organizerKeys.orgChat, queryFn: () => orgChatService.get() })
}
