import { axiosInstance } from '../axiosInstance'

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
  age: number
  status: CheckinStatus
  /** E.164 phone for the organizer's call button, e.g. '+998901234567'. */
  phone?: string
  socials?: {
    telegram?: string
    instagram?: string
    facebook?: string
    linkedin?: string
  }
}

/** Body for adding a participant to a camp's roster by phone. */
export type AddRosterBody = {
  phone: string
  groupId?: string | null
}

export const rosterService = {
  /** The camp's participants, alphabetical by name (server-ordered). */
  list: async (campId: string): Promise<RosterParticipant[]> => {
    return (await axiosInstance.get<RosterParticipant[]>(`/organizer/camps/${campId}/roster`)).data
  },

  /** Adds a participant (by phone) to the camp's roster, optionally into a group. */
  add: async (campId: string, body: AddRosterBody): Promise<RosterParticipant> => {
    return (await axiosInstance.post<RosterParticipant>(`/organizer/camps/${campId}/roster`, body))
      .data
  },

  /*
    Reassigns an existing roster member's group (null = unassign). Camps are built
    before people are sorted, so group membership has to stay editable for the whole
    life of the camp — not just at the moment a participant is added.
  */
  update: async (
    campId: string,
    membershipId: string,
    patch: { groupId: string | null },
  ): Promise<RosterParticipant> => {
    return (
      await axiosInstance.patch<RosterParticipant>(
        `/organizer/camps/${campId}/roster/${membershipId}`,
        patch,
      )
    ).data
  },
}
