import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaderboardService, type PointCategory } from '../services/leaderboard.service'
import { campKeys } from '../queryKeys'

/*
  The leaderboard QUERIES — the React layer over leaderboardService. Components call
  these hooks only. The read is cached by campKeys.leaderboard(campId); the write
  invalidates that same key, so the organizer's Leaderboard tab AND the participant's
  Ranks screen (both keyed campKeys.leaderboard) refetch and re-rank when points move.
*/

/** Group standings for a camp (raw scores; deriveLeaderboard ranks them client-side). */
export function useLeaderboard(campId: string) {
  return useQuery({
    queryKey: campKeys.leaderboard(campId),
    queryFn: () => leaderboardService.get(campId),
    // An unresolved camp would request /camps//leaderboard — hold until it's known.
    enabled: Boolean(campId),
  })
}

/*
  The WRITE side — the organizer awards / deducts a group's points. Preserves the
  call shape the UI already uses: adjust.mutate({ groupId, delta }); `category`
  defaults to 'activities' until the points wheel lets the organizer pick one.
*/
export function useAdjustGroupPoints(campId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      groupId,
      delta,
      category = 'activities',
    }: {
      groupId: string
      delta: number
      category?: PointCategory
    }) => leaderboardService.adjust(campId, groupId, delta, category),
    onSuccess: () => qc.invalidateQueries({ queryKey: campKeys.leaderboard(campId) }),
  })
}
