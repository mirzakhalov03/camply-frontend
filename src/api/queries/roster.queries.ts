import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rosterService } from '../services/roster.service'
import type { AddRosterBody } from '../services/roster.service'
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

/** POST /organizer/camps/:id/roster → refresh this camp's roster. */
export function useAddRoster(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: AddRosterBody) => rosterService.add(campId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campKeys.roster(campId) })
    },
  })
}

/*
  PATCH /organizer/camps/:id/roster/:mid → move a participant between groups.

  Invalidates the whole camp, not just the roster: group member counts, the
  leaderboard's per-group standings, and the participant's own "my group" card all
  read from this same assignment, so refreshing the roster alone would leave those
  stale until the next reload.
*/
export function useUpdateRoster(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ membershipId, groupId }: { membershipId: string; groupId: string | null }) =>
      rosterService.update(campId, membershipId, { groupId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campKeys.all(campId) })
    },
  })
}
