import { useQuery } from '@tanstack/react-query'
import { meService } from '../services/me.service'
import { participantKeys } from '../queryKeys'

/*
  The participant's camps. ParticipantDashboard calls this to resolve the active
  camp and shares its id through CampContext.

  useCampHome also calls it — that's deliberate, not a double fetch: React Query
  dedupes by queryKey, so both read ONE cached result. Composing home from this
  cache is why the participant never pays for a second camp request (and never
  touches GET /camps/:id, which still carries organizer roster counts).
*/
export function useMyCamps() {
  return useQuery({
    queryKey: participantKeys.camps,
    queryFn: () => meService.camps(),
  })
}
