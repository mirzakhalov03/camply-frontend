import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CAMP_GROUPS } from '../lib/groups'

/*
  The uncommitted camp-creation draft. This is CLIENT-OWNED form state (nothing is
  on the server until the wizard's Finish), so it lives in Zustand, not React Query.
  `persist` → localStorage makes the whole wizard survive a refresh / PWA relaunch.

  `progress` is the COMMIT LEDGER: the real campId once created, a tempId→realId map
  for groups, and the tempIds of participants already POSTed. useCommitCampDraft
  consults it so a retry after a mid-way failure skips finished work (no duplicates).
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

type Progress = {
  campId: string | null
  groupIdMap: Record<string, string>
  addedParticipantTempIds: string[]
  published: boolean
}

type CampDraftState = {
  info: CampDraftInfo
  groups: DraftGroup[]
  participants: DraftParticipant[]
  progress: Progress
  patchInfo: (patch: Partial<CampDraftInfo>) => void
  addGroup: (name: string) => void
  removeGroup: (tempId: string) => void
  addParticipant: (phone: string, groupTempId: string) => void
  removeParticipant: (tempId: string) => void
  setCampId: (id: string) => void
  mapGroupId: (tempId: string, realId: string) => void
  markParticipantAdded: (tempId: string) => void
  markPublished: () => void
  reset: () => void
}

const EMPTY_INFO: CampDraftInfo = { name: '', location: '', starts: '', ends: '', capacity: '' }
const EMPTY_PROGRESS: Progress = {
  campId: null,
  groupIdMap: {},
  addedParticipantTempIds: [],
  published: false,
}

export const useCampDraftStore = create<CampDraftState>()(
  persist(
    (set) => ({
      info: EMPTY_INFO,
      groups: [],
      participants: [],
      progress: EMPTY_PROGRESS,
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
      setCampId: (id) => set((s) => ({ progress: { ...s.progress, campId: id } })),
      mapGroupId: (tempId, realId) =>
        set((s) => ({
          progress: { ...s.progress, groupIdMap: { ...s.progress.groupIdMap, [tempId]: realId } },
        })),
      markParticipantAdded: (tempId) =>
        set((s) => ({
          progress: {
            ...s.progress,
            addedParticipantTempIds: [...s.progress.addedParticipantTempIds, tempId],
          },
        })),
      markPublished: () => set((s) => ({ progress: { ...s.progress, published: true } })),
      reset: () =>
        set({ info: EMPTY_INFO, groups: [], participants: [], progress: EMPTY_PROGRESS }),
    }),
    { name: 'camply-camp-draft' },
  ),
)
