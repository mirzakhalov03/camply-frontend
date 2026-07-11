import { rosterMock } from '../../lib/mockRoster'
import { CAMP_GROUPS } from '../../lib/groups'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

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
  list: async (_campId: string): Promise<CampGroupDetail[]> => {
    // return (await axiosInstance.get<CampGroupDetail[]>(`/organizer/camps/${_campId}/groups`)).data
    return CAMP_GROUPS.map((g) => {
      const members: GroupMember[] = rosterMock
        .filter((p) => p.groupId === g.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          initials: p.initials,
          avatarColor: p.avatarColor,
          photo: p.photo ?? null,
          isLeader: Boolean(p.isLeader),
        }))
      return {
        id: g.id,
        name: g.name,
        color: g.color,
        memberCount: members.length,
        leaderName: members.find((m) => m.isLeader)?.name ?? null,
        members,
      }
    }).filter((g) => g.memberCount > 0)
  },
}
