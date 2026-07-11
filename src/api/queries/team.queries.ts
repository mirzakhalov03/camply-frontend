import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamService, type OrganizerRole } from '../services/team.service'
import { organizerKeys } from '../queryKeys'

/*
  The team QUERIES — reads + writes over teamService. Reads use useQuery keyed from
  the registry (organizerKeys.team); the invite/cancel mutations invalidate that one
  key so the members list, pending list, and header count all refetch together.
  Components call these hooks only.
*/
export function useTeam() {
  return useQuery({ queryKey: organizerKeys.team, queryFn: () => teamService.list() })
}

export function useInviteTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { phone: string; role: OrganizerRole }) => teamService.invite(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.team }),
  })
}

export function useCancelInvite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teamService.cancelInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: organizerKeys.team }),
  })
}
