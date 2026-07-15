import { axiosInstance } from '../axiosInstance'

/*
  The managers SERVICE — the backend boundary for the org-only /managers routes.
  Mirrors organizers.service: a thin, typed wrapper over axiosInstance owning the
  Manager data contract and unwrapping the response envelopes. No React here. Only
  the org provisions managers (a manager can't mint a peer manager — server-enforced).
*/

export type ManagerStatus = 'pending' | 'active' | 'deactivated'

export type Manager = {
  id: string
  email: string | null
  phone: string | null
  name: string
  surname: string
  status: ManagerStatus
  createdAt: string
}

/** Invite a manager: the org records name + email + phone; the manager completes
 *  onboarding via an emailed link. `phone` is 9 raw national digits (the backend
 *  canonicalizes to +998…). */
export type CreateManagerBody = {
  name: string
  surname: string
  email: string
  phone: string
}

export const managersService = {
  list: async (): Promise<Manager[]> => {
    const res = await axiosInstance.get<{ managers: Manager[] }>('/managers')
    return res.data.managers
  },
  create: async (body: CreateManagerBody): Promise<{ manager: Manager; inviteUrl?: string }> => {
    const res = await axiosInstance.post<{ manager: Manager; inviteUrl?: string }>(
      '/managers',
      body,
    )
    return res.data
  },
  resendInvite: async (id: string): Promise<{ manager: Manager; inviteUrl?: string }> => {
    const res = await axiosInstance.post<{ manager: Manager; inviteUrl?: string }>(
      `/managers/${id}/resend`,
    )
    return res.data
  },
  /** DELETE /managers/:id — pending → cancels the invite; active/deactivated →
   *  hard-deletes. Same endpoint, two intents (see the queries layer). */
  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/managers/${id}`)
  },
  setActive: async (id: string, active: boolean): Promise<Manager> => {
    const res = await axiosInstance.patch<{ manager: Manager }>(`/managers/${id}`, { active })
    return res.data.manager
  },
}
