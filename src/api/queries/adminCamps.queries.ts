import { useQuery } from '@tanstack/react-query'
import { adminCampsService } from '../services/adminCamps.service'
import { adminCampKeys } from '../queryKeys'

/*
  The admin CAMPS query — the React layer over adminCampsService. Components call
  this hook only. Keyed from the registry so a future realtime/invalidation nudge
  refreshes every subscriber for free.
*/
export function useAdminCamps() {
  return useQuery({
    queryKey: adminCampKeys.list(),
    queryFn: adminCampsService.list,
  })
}
