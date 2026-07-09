import { rosterMock } from '../../lib/mockRoster'
import { CAMP_GROUPS } from '../../lib/groups'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

/*
  The roster SERVICE — the backend boundary for a camp's participant list, as the
  organizer sees it (identity, group, check-in status). The types here are the DATA
  CONTRACT; the UI depends on these shapes, never on where data comes from. No React.

  Today list() returns mock data, joining each row's `groupId` to CAMP_GROUPS so the
  group name/color live in ONE place. Flipping to the real API touches only list().
*/

/** On-site vs out-of-bounds — the organizer's check-in glance (prototype In/Out). */
export type CheckinStatus = 'in' | 'out'

export type RosterParticipant = {
  id: string
  name: string
  initials: string
  avatarColor: string
  photo?: string | null
  /** Group assignment, denormalized for display. Null if unassigned. */
  groupId: string | null
  groupName: string | null
  city: string
  status: CheckinStatus
}

const GROUP_NAME = new Map(CAMP_GROUPS.map((g) => [g.id, g.name]))

export const rosterService = {
  /** The camp's participants, alphabetical by name (server-ordered). */
  list: async (_campId: string): Promise<RosterParticipant[]> => {
    // return (await axiosInstance.get<RosterParticipant[]>(`/organizer/camps/${_campId}/roster`)).data
    return rosterMock
      .map((p) => ({
        id: p.id,
        name: p.name,
        initials: p.initials,
        avatarColor: p.avatarColor,
        photo: p.photo ?? null,
        groupId: p.groupId,
        groupName: p.groupId ? (GROUP_NAME.get(p.groupId) ?? null) : null,
        city: p.city,
        status: p.status,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  },
}
