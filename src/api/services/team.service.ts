import { teamMock } from '../../lib/mockTeam'
import type { OrganizerRole } from '../../components/organizer/roles'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

/*
  The team SERVICE — the organizer's co-organizers + pending invites. The DATA
  CONTRACT uses the REAL role hierarchy: every teammate has an OrganizerRole
  (permission-limited sub-role), never the prototype's dead Owner/Admin labels.
  Organizers grant sub-roles; they can't mint peer organizers (enforced server-side,
  guardrail). No React here.
*/

/** Role type reused from the canonical role set (components/organizer/roles). */
export type { OrganizerRole }

export type TeamMember = {
  id: string
  name: string
  initials: string
  avatarColor: string
  photo?: string | null
  role: OrganizerRole
  /** True for the current organizer. */
  isMe?: boolean
}

export type PendingInvite = {
  id: string
  /** Display-formatted phone, e.g. "+998 90 777 12 34". */
  phone: string
  role: OrganizerRole
  /** ISO 8601 UTC — the UI formats "invited 2d ago" per language. */
  sentAt: string
}

export type Team = {
  organizationName: string
  members: TeamMember[]
  pending: PendingInvite[]
}

export const teamService = {
  list: async (): Promise<Team> => {
    // return (await axiosInstance.get<Team>('/organizer/team')).data
    return teamMock
  },

  /** Invite a teammate by phone + sub-role. Adds a pending invite for the session. */
  invite: async (input: { phone: string; role: OrganizerRole }): Promise<PendingInvite> => {
    // return (await axiosInstance.post<PendingInvite>('/organizer/team/invites', input)).data
    const created: PendingInvite = {
      id: `inv-${Date.now()}`,
      phone: input.phone,
      role: input.role,
      sentAt: new Date().toISOString(),
    }
    teamMock.pending.unshift(created)
    return created
  },

  /** Cancel a pending invite. */
  cancelInvite: async (id: string): Promise<void> => {
    // await axiosInstance.delete(`/organizer/team/invites/${id}`)
    teamMock.pending = teamMock.pending.filter((p) => p.id !== id)
  },
}
