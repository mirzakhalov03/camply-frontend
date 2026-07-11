import { useQuery } from '@tanstack/react-query'
import { campsService } from '../services/camps.service'
import { organizerKeys } from '../queryKeys'

/*
  The camps QUERIES — the React layer over campsService. Components call these hooks
  only; never the service or axios. Keyed from the registry (organizerKeys) so a
  future realtime "camp:changed" event can invalidate the list and every subscribed
  screen refetches for free.
*/

export function useOrganizerCamps() {
  return useQuery({
    queryKey: organizerKeys.camps,
    queryFn: () => campsService.list(),
  })
}

export function useOrganizerSummary() {
  return useQuery({
    queryKey: organizerKeys.summary,
    queryFn: () => campsService.summary(),
  })
}

/** A single camp's meta for the detail header. Enabled only with a campId. */
export function useOrganizerCamp(campId: string) {
  return useQuery({
    queryKey: organizerKeys.camp(campId),
    queryFn: () => campsService.get(campId),
    enabled: Boolean(campId),
  })
}
