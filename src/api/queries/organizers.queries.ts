import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { organizersService, type CreateOrganizerBody } from '../services/organizers.service'
import { adminOrganizerKeys } from '../queryKeys'

/*
  The organizers QUERIES — the React layer over organizersService for the /admin
  surface. Components call these hooks only. The read is cached by
  adminOrganizerKeys; both mutations invalidate it so the list stays fresh.
*/

export function useOrganizers() {
  return useQuery({
    queryKey: adminOrganizerKeys.list(),
    queryFn: organizersService.list,
  })
}

export function useCreateOrganizer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateOrganizerBody) => organizersService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminOrganizerKeys.all }),
  })
}

export function useSetOrganizerActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      organizersService.setActive(id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminOrganizerKeys.all }),
  })
}

export function useResendInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizersService.resendInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminOrganizerKeys.all }),
  })
}

// Cancel a *pending* organizer's invite. Same DELETE endpoint as useDeleteOrganizer;
// kept as its own hook so the pending vs active/deactivated intents read distinctly.
export function useRevokeInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminOrganizerKeys.all }),
  })
}

// Delete an active/deactivated organizer outright.
export function useDeleteOrganizer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminOrganizerKeys.all }),
  })
}
