import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { helpRequestsService } from '../services/helpRequests.service'
import { organizerKeys } from '../queryKeys'

/*
  The help-requests QUERY — active SOS alerts for the organizer dashboard. Kept on
  its own key so the realtime bridge can push new alerts straight into this cache
  (setQueryData) the instant a participant fires SOS, without touching the camps
  list. Components call this hook only.
*/
export function useActiveHelpRequests() {
  return useQuery({
    queryKey: organizerKeys.helpRequests,
    queryFn: () => helpRequestsService.listActive(),
  })
}

/*
  Resolve an SOS request. Invalidating the ONE help key means every surface that
  reads it updates together — the dashboard banner disappears and the profile card
  flips to "all safe" from a single write. This is the shared-domain payoff for the
  safety-critical path.
*/
export function useResolveHelpRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => helpRequestsService.resolve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.helpRequests }),
  })
}
