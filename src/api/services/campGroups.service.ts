import { axiosInstance } from '../axiosInstance'

/*
  The camp-groups SERVICE — the organizer's Groups tab. The DATA CONTRACT is a group
  with its members + leader. Today it's DERIVED from the same roster the Participants
  tab reads (grouped by groupId), so member counts can't drift; the real backend will
  serve this shape directly and list() swaps to one axios call. No React here.
*/

export type GroupMember = {
  id: string
  name: string
  initials: string
  avatarColor: string
  photo?: string | null
  isLeader: boolean
}

export type CampGroupDetail = {
  id: string
  name: string
  /** Brand-palette group color (runtime data, applied inline). */
  color: string
  memberCount: number
  leaderName: string | null
  members: GroupMember[]
}

export const campGroupsService = {
  /** Groups that have members in this camp, in canonical CAMP_GROUPS order. */
  list: async (campId: string): Promise<CampGroupDetail[]> => {
    return (await axiosInstance.get<CampGroupDetail[]>(`/organizer/camps/${campId}/groups`)).data
  },

  /** Creates an empty group in the camp. Color is a brand-palette hex from CAMP_GROUPS. */
  create: async (
    campId: string,
    body: { name: string; color: string },
  ): Promise<CampGroupDetail> => {
    return (await axiosInstance.post<CampGroupDetail>(`/organizer/camps/${campId}/groups`, body))
      .data
  },

  /** Removes a group (its members become unassigned server-side). */
  remove: async (campId: string, groupId: string): Promise<void> => {
    await axiosInstance.delete(`/organizer/camps/${campId}/groups/${groupId}`)
  },
}
