import { useMutation, useQueryClient } from '@tanstack/react-query'
import { campsService } from '../services/camps.service'
import { organizerKeys } from '../queryKeys'
import { useCampDraftStore } from '../../store/useCampDraftStore'

/*
  Commits the in-memory camp draft on the wizard's Finish in ONE request. The backend
  (POST /organizer/camps) accepts the whole aggregate — camp + groups + participants —
  and owns consistency (validate-first + compensating cleanup) and idempotency (dedupe
  on clientRequestId), so the client no longer orchestrates or tracks a progress
  ledger. A retry re-sends the same payload; clientRequestId makes it safe.
*/
export function useCommitCampDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const { info, groups, participants, clientRequestId } = useCampDraftStore.getState()
      const cap = info.capacity.trim() ? Number(info.capacity) : undefined
      const camp = await campsService.createFull({
        name: info.name.trim(),
        location: info.location.trim(),
        startsAt: new Date(info.starts).toISOString(),
        endsAt: new Date(info.ends).toISOString(),
        ...(cap !== undefined && Number.isFinite(cap) && cap > 0 ? { capacity: cap } : {}),
        status: 'published',
        clientRequestId,
        groups: groups.map((g) => ({ ref: g.tempId, name: g.name, color: g.color })),
        participants: participants.map((p) => ({ phone: p.phone, groupRef: p.groupTempId })),
      })
      return camp.id
    },
    onSuccess: (campId) => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
      queryClient.invalidateQueries({ queryKey: organizerKeys.camp(campId) })
      useCampDraftStore.getState().reset()
    },
  })
}
