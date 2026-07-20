import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { scheduleService, type NewActivity, type ActivityPatch } from '../services/schedule.service'
import { campKeys } from '../queryKeys'

/*
  The schedule QUERIES — the React layer over scheduleService. Components call this
  hook only; never the service or axios. Keyed from the registry (campKeys.schedule)
  so a future realtime "schedule:changed" event can invalidate it and every
  subscribed screen (home widget + full screen) refetches for free.
*/
export function useSchedule(campId: string) {
  return useQuery({
    queryKey: campKeys.schedule(campId),
    queryFn: () => scheduleService.list(campId),
    // An unresolved camp would request /camps//schedule — hold until it's known.
    enabled: Boolean(campId),
  })
}

/*
  The WRITE side — the organizer adds an activity. On success it invalidates the
  camp's schedule key, so the organizer's Schedule tab AND the participant's home
  widget + schedule screen (all keyed campKeys.schedule) refetch and show it.
*/
export function useCreateActivity(campId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (activity: NewActivity) => scheduleService.create(activity),
    onSuccess: () => qc.invalidateQueries({ queryKey: campKeys.schedule(campId) }),
  })
}

/** Edit an existing activity. Same cache invalidation as create. */
export function useUpdateActivity(campId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ activityId, patch }: { activityId: string; patch: ActivityPatch }) =>
      scheduleService.update(campId, activityId, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: campKeys.schedule(campId) }),
  })
}

/** Remove an activity. Destructive — the caller must confirm before firing. */
export function useDeleteActivity(campId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (activityId: string) => scheduleService.remove(campId, activityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: campKeys.schedule(campId) }),
  })
}
