import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campsService } from '../services/camps.service'
import type { CreateCampBody } from '../services/camps.service'
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

/** POST /organizer/camps → refresh the camps list and the header summary counts. */
export function useCreateCamp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCampBody) => campsService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
    },
  })
}

export function useUpdateCamp(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<CreateCampBody>) => campsService.update(campId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
      queryClient.invalidateQueries({ queryKey: organizerKeys.camp(campId) })
    },
  })
}

export function usePublishCamp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (campId: string) => campsService.publish(campId),
    onSuccess: (_data, campId) => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
      queryClient.invalidateQueries({ queryKey: organizerKeys.camp(campId) })
    },
  })
}
