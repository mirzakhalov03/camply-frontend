import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CAMP_GROUPS } from '../lib/groups'

/*
  The uncommitted camp-creation draft — CLIENT-OWNED form state (nothing hits the
  server until Finish), so it lives in Zustand, not React Query. `persist` →
  localStorage makes the whole wizard survive a refresh / PWA relaunch.

  `clientRequestId` is a stable idempotency key: the batch endpoint dedupes on it, so
  re-pressing Finish after a timeout returns the existing camp instead of duplicating.
  It's persisted (survives refresh) and regenerated on reset() for the next camp.
*/
export type DraftGroup = { tempId: string; name: string; color: string }
export type DraftParticipant = { tempId: string; phone: string; groupTempId: string }
export type CampDraftInfo = {
  name: string
  location: string
  starts: string // YYYY-MM-DD
  ends: string
  capacity: string
}

type CampDraftState = {
  clientRequestId: string
  info: CampDraftInfo
  groups: DraftGroup[]
  participants: DraftParticipant[]
  patchInfo: (patch: Partial<CampDraftInfo>) => void
  addGroup: (name: string) => void
  removeGroup: (tempId: string) => void
  addParticipant: (phone: string, groupTempId: string) => void
  removeParticipant: (tempId: string) => void
  reset: () => void
}

const EMPTY_INFO: CampDraftInfo = { name: '', location: '', starts: '', ends: '', capacity: '' }

export const useCampDraftStore = create<CampDraftState>()(
  persist(
    (set) => ({
      clientRequestId: crypto.randomUUID(),
      info: EMPTY_INFO,
      groups: [],
      participants: [],
      patchInfo: (patch) => set((s) => ({ info: { ...s.info, ...patch } })),
      addGroup: (name) =>
        set((s) => {
          const color = CAMP_GROUPS[s.groups.length % CAMP_GROUPS.length].color
          return { groups: [...s.groups, { tempId: crypto.randomUUID(), name, color }] }
        }),
      removeGroup: (tempId) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.tempId !== tempId),
          participants: s.participants.filter((p) => p.groupTempId !== tempId),
        })),
      addParticipant: (phone, groupTempId) =>
        set((s) => ({
          participants: [...s.participants, { tempId: crypto.randomUUID(), phone, groupTempId }],
        })),
      removeParticipant: (tempId) =>
        set((s) => ({ participants: s.participants.filter((p) => p.tempId !== tempId) })),
      reset: () =>
        set({
          clientRequestId: crypto.randomUUID(),
          info: EMPTY_INFO,
          groups: [],
          participants: [],
        }),
    }),
    { name: 'camply-camp-draft' },
  ),
)
