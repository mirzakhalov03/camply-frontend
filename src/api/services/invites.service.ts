import { axiosInstance } from '../axiosInstance'
import type { AuthUser } from '../../store/useAuthStore'

/*
  The PUBLIC invite boundary — an invited organizer fetches their invite and accepts
  it by supplying a phone (no existing session; the token is the authorization).
  accept() returns the now-authenticated user (the backend set the session cookie),
  unwrapping { user } exactly like authService.login does.
*/
export type PublicInvite = { name: string; email: string }

export const invitesService = {
  get: async (token: string): Promise<PublicInvite> => {
    const res = await axiosInstance.get<PublicInvite>(`/invite/${token}`)
    return res.data
  },
  accept: async (token: string, phone: string): Promise<AuthUser> => {
    const res = await axiosInstance.post<{ user: AuthUser }>(`/invite/${token}/accept`, { phone })
    return res.data.user
  },
}
