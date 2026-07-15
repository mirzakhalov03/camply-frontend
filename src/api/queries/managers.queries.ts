import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { managersService, type CreateManagerBody } from '../services/managers.service'
import { adminManagerKeys } from '../queryKeys'

/*
  The managers QUERIES — the React layer over managersService for the /admin surface.
  Mirror of organizers.queries. Components call these hooks only. The read is cached
  by adminManagerKeys; every mutation invalidates it so the list stays fresh.
*/

export function useManagers() {
  return useQuery({
    queryKey: adminManagerKeys.list(),
    queryFn: managersService.list,
  })
}

export function useCreateManager() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateManagerBody) => managersService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminManagerKeys.all }),
  })
}

export function useSetManagerActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      managersService.setActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminManagerKeys.all }),
  })
}

export function useResendManagerInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => managersService.resendInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminManagerKeys.all }),
  })
}

// Cancel a *pending* manager's invite. Same DELETE endpoint as useDeleteManager;
// kept distinct so the pending vs active/deactivated intents read clearly.
export function useRevokeManagerInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => managersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminManagerKeys.all }),
  })
}

// Delete an active/deactivated manager outright.
export function useDeleteManager() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => managersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminManagerKeys.all }),
  })
}
