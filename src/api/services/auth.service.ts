import { axiosInstance } from '../axiosInstance'
import type { AuthUser } from '../../store/useAuthStore'

/*
  The auth SERVICE — the backend boundary for participant sign-in. A thin, typed
  wrapper over axiosInstance: it knows the endpoints + the request/response shapes,
  nothing about React. Queries (api/queries/) call these; components never do.

  Contract note: /auth/login wraps the user as { user }; /auth/me (GET and PATCH)
  return the user flat. The service unwraps both to a plain AuthUser.
*/

/*
  Participants/organizers sign in by phone (9 national digits; organizers add a
  password). The organization signs in by username + password — it has no phone.
*/
export type LoginRequest =
  { phone: string; password?: string } | { username: string; password: string }

/*
  What the participant/organizer completes after claiming their spot. Shared by
  both roles: name/surname are always sent; `subRole` is organizer-only (the team
  role they're onboarding into) and left off for participants.
*/
export type CompleteProfileRequest = {
  name: string
  surname: string
  cityId: string
  age: number
  photo?: string | null
  subRole?: string
}

export const authService = {
  login: async (body: LoginRequest): Promise<AuthUser> => {
    const { data } = await axiosInstance.post<{ user: AuthUser }>('/auth/login', body)
    return data.user
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await axiosInstance.get<AuthUser>('/auth/me')
    return data
  },

  completeProfile: async (body: CompleteProfileRequest): Promise<AuthUser> => {
    const { data } = await axiosInstance.patch<AuthUser>('/auth/me', body)
    return data
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout')
  },
}
