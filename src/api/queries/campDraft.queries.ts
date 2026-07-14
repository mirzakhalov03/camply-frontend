import { useMutation, useQueryClient } from '@tanstack/react-query'
import { campsService } from '../services/camps.service'
import { campGroupsService } from '../services/campGroups.service'
import { rosterService } from '../services/roster.service'
import { organizerKeys } from '../queryKeys'
import { useCampDraftStore } from '../../store/useCampDraftStore'

/*
  Commits the in-memory camp draft on the wizard's Finish. The backend has no batch
  endpoint, so this orchestrates the per-entity sequence create camp → groups →
  participants → publish. It is RESUMABLE: each stage reads the draft's progress
  ledger and skips work that already succeeded, so a retry after a mid-way network
  failure never duplicates. Reads store state via getState() so it always sees the
  latest ledger it just wrote. On success it invalidates the organizer camp lists
  and clears the draft.
*/
export function useCommitCampDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const s = () => useCampDraftStore.getState()

      // 1. Create the draft camp if it doesn't exist yet.
      let campId = s().progress.campId
      if (!campId) {
        const info = s().info
        const cap = info.capacity.trim() ? Number(info.capacity) : undefined
        const camp = await campsService.create({
          name: info.name.trim(),
          location: info.location.trim(),
          startsAt: new Date(info.starts).toISOString(),
          endsAt: new Date(info.ends).toISOString(),
          ...(cap !== undefined && Number.isFinite(cap) && cap > 0 ? { capacity: cap } : {}),
        })
        campId = camp.id
        s().setCampId(campId)
      }

      // 2. Create each group not already mapped to a real id.
      for (const g of s().groups) {
        if (s().progress.groupIdMap[g.tempId]) continue
        const created = await campGroupsService.create(campId, { name: g.name, color: g.color })
        s().mapGroupId(g.tempId, created.id)
      }

      // 3. Add each participant not already added, into its group's real id.
      for (const p of s().participants) {
        if (s().progress.addedParticipantTempIds.includes(p.tempId)) continue
        const groupId = s().progress.groupIdMap[p.groupTempId] ?? null
        await rosterService.add(campId, { phone: p.phone, groupId })
        s().markParticipantAdded(p.tempId)
      }

      // 4. Publish, unless a prior attempt already did.
      if (!s().progress.published) {
        await campsService.publish(campId)
        s().markPublished()
      }

      return campId
    },
    onSuccess: (campId) => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
      queryClient.invalidateQueries({ queryKey: organizerKeys.camp(campId) })
      useCampDraftStore.getState().reset()
    },
  })
}
