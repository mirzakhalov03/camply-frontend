import { axiosInstance } from '../axiosInstance'

/*
  The organizers SERVICE — the backend boundary for the organization admin surface
  (org-only /organizers routes). A thin, typed wrapper over axiosInstance; it owns
  the Organizer data contract and unwraps the response envelopes. No React here.
*/

export type OrganizerStatus = 'pending' | 'active' | 'deactivated'

export type Organizer = {
  id: string
  email: string | null
  phone: string | null
  name: string
  surname: string
  status: OrganizerStatus
  createdAt: string
}

/** Create-by-email: the organizer completes onboarding via an emailed link. */
export type CreateOrganizerBody = {
  name: string
  surname: string
  email: string
}

export const organizersService = {
  list: async (): Promise<Organizer[]> => {
    const res = await axiosInstance.get<{ organizers: Organizer[] }>('/organizers')
    return res.data.organizers
  },
  create: async (
    body: CreateOrganizerBody,
  ): Promise<{ organizer: Organizer; inviteUrl?: string }> => {
    const res = await axiosInstance.post<{ organizer: Organizer; inviteUrl?: string }>(
      '/organizers',
      body,
    )
    return res.data
  },
  resendInvite: async (id: string): Promise<{ organizer: Organizer; inviteUrl?: string }> => {
    const res = await axiosInstance.post<{ organizer: Organizer; inviteUrl?: string }>(
      `/organizers/${id}/resend`,
    )
    return res.data
  },
  revokeInvite: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/organizers/${id}`)
  },
  setActive: async (id: string, active: boolean): Promise<Organizer> => {
    const res = await axiosInstance.patch<{ organizer: Organizer }>(`/organizers/${id}`, {
      active,
    })
    return res.data.organizer
  },
}
