import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '../services/schedule.service'
import { CURRENT_CAMP_ID } from '../services/announcements.service'
import { campKeys } from '../queryKeys'

/*
  The schedule QUERIES — the React layer over scheduleService. Components call this
  hook only; never the service or axios. Keyed from the registry (campKeys.schedule)
  so a future realtime "schedule:changed" event can invalidate it and every
  subscribed screen (home widget + full screen) refetches for free.
*/
export function useSchedule(campId: string = CURRENT_CAMP_ID) {
  return useQuery({
    queryKey: campKeys.schedule(campId),
    queryFn: () => scheduleService.list(campId),
  })
}
