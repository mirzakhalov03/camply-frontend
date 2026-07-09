import { useQuery } from '@tanstack/react-query'
import { rosterService } from '../services/roster.service'
import { campKeys } from '../queryKeys'

/*
  The roster QUERY — a camp's participant list. Keyed camp-scoped (campKeys.roster)
  so one `invalidateQueries({ queryKey: campKeys.all(campId) })` refreshes it along
  with the rest of the camp, and a realtime "checkin:changed" event can nudge just
  this slice. Components call this hook only.
*/
export function useRoster(campId: string) {
  return useQuery({
    queryKey: campKeys.roster(campId),
    queryFn: () => rosterService.list(campId),
    enabled: Boolean(campId),
  })
}
