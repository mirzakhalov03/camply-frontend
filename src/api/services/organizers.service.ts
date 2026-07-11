import { axiosInstance } from '../axiosInstance'

/*
  The organizers SERVICE — the backend boundary for the organization admin surface
  (org-only /organizers routes). A thin, typed wrapper over axiosInstance; it owns
  the Organizer data contract and unwraps the response envelopes. No React here.
*/

export type Organizer = {
  id: string
  phone: string | null
  name: string
  surname: string
  active: boolean
  createdAt: string
}

/** phone is 9 national digits (the backend canonicalizes to +998…). */
export type CreateOrganizerBody = {
  phone: string
  name: string
  surname: string
  password: string
}

export const organizersService = {
  list: async (): Promise<Organizer[]> => {
    const res = await axiosInstance.get<{ organizers: Organizer[] }>('/organizers')
    return res.data.organizers
  },
  create: async (body: CreateOrganizerBody): Promise<Organizer> => {
    const res = await axiosInstance.post<{ organizer: Organizer }>('/organizers', body)
    return res.data.organizer
  },
  setActive: async (id: string, active: boolean): Promise<Organizer> => {
    const res = await axiosInstance.patch<{ organizer: Organizer }>(`/organizers/${id}`, {
      active,
    })
    return res.data.organizer
  },
}
