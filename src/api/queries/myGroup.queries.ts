import { useQuery } from '@tanstack/react-query'
import { myGroupService } from '../services/myGroup.service'
import { campKeys } from '../queryKeys'

/** The caller's own group. Resolves to null when unassigned — not an error state. */
export function useMyGroup(campId: string) {
  return useQuery({
    queryKey: campKeys.myGroup(campId),
    queryFn: () => myGroupService.get(campId),
    enabled: Boolean(campId),
  })
}
