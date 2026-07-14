import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campGroupsService } from '../services/campGroups.service'
import { campKeys } from '../queryKeys'

/*
  The camp-groups QUERY — a camp's groups with members, for the Groups tab. Keyed
  camp-scoped (campKeys.groups) so it invalidates with the camp and a realtime
  "roster:changed" event refreshes it. Components call this hook only.
*/
export function useCampGroups(campId: string) {
  return useQuery({
    queryKey: campKeys.groups(campId),
    queryFn: () => campGroupsService.list(campId),
    enabled: Boolean(campId),
  })
}

export function useCreateGroup(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; color: string }) => campGroupsService.create(campId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: campKeys.groups(campId) }),
  })
}

export function useDeleteGroup(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => campGroupsService.remove(campId, groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: campKeys.groups(campId) }),
  })
}
