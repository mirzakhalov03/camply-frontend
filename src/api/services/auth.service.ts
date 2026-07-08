import { axiosInstance } from '../axiosInstance'
import type { AuthUser, AuthRole } from '../../store/useAuthStore'

/*
  The auth SERVICE — the backend boundary for sign-in. A service is a thin,
  typed wrapper over axiosInstance: it knows the endpoint + the request/response
  shapes, nothing about React. Queries (api/queries/) call these; components
  never do.

  The request/response types below are the DATA CONTRACT — what the backend will
  send and receive. Adjust them to the real API when it lands; the queries and UI
  depend on these shapes, not on axios.
*/

/** Login is phone-first (matches the onboarding flow — no password yet). */
export type LoginRequest = { phone: string }

/** Everything the registration form commits, plus phone + chosen role. */
export type RegisterRequest = {
  phone: string
  name: string
  surname: string
  cityId: string
  age: number
  role: AuthRole
  photo?: string | null
}

/** Both login and register return a session: the token + who you are. */
export type AuthSession = { token: string; user: AuthUser }

export const authService = {
  login: async (body: LoginRequest): Promise<AuthSession> => {
    const { data } = await axiosInstance.post<AuthSession>('/auth/login', body)
    return data
  },

  register: async (body: RegisterRequest): Promise<AuthSession> => {
    const { data } = await axiosInstance.post<AuthSession>('/auth/register', body)
    return data
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await axiosInstance.get<AuthUser>('/auth/me')
    return data
  },
}
