import { axiosInstance } from '../axiosInstance'
import type { AuthUser } from '../../store/useAuthStore'

/*
  The invite SERVICE — the backend boundary for an organizer accepting a team
  invite. A thin, typed wrapper over axiosInstance: it knows the endpoints + the
  request/response shapes, nothing about React. Queries (api/queries/) call these;
  components never do.

  Contract note: GET /invite/:token returns the public preview (who's inviting,
  what email); POST /invite/:token/accept wraps the created identity as { user },
  same unwrap convention as /auth/login.
*/

/** The public preview shown before the invitee commits (no auth required). */
export type PublicInvite = {
  name: string
  email: string
}

export const inviteService = {
  /** GET /invite/:token — the public preview. 404/410 if unknown or expired. */
  get: async (token: string): Promise<PublicInvite> => {
    const { data } = await axiosInstance.get<PublicInvite>(`/invite/${token}`)
    return data
  },

  /** POST /invite/:token/accept — claims the invite, returns the new session identity. */
  accept: async (token: string, phone: string): Promise<AuthUser> => {
    const { data } = await axiosInstance.post<{ user: AuthUser }>(`/invite/${token}/accept`, {
      phone,
    })
    return data.user
  },
}
