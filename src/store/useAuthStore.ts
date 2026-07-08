import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  CLIENT state — the auth SESSION: the token and the identity the backend hands
  back at login. This is the one place the app's bearer token lives; the axios
  request interceptor reads it from here (useAuthStore.getState().token) to
  authorize every call, and the response interceptor clears it on a 401.

  Persisted, so a logged-in session survives a reload / PWA relaunch. This holds
  WHO you are + your token — not your editable profile fields (name, city,
  socials); those stay in useProfileStore. Server-authored data (membership,
  points) stays in React Query. Keeping the three apart is what makes each swap
  to a real endpoint local.
*/

// The role hierarchy (Context.md): organization super-admin > organizer >
// participant. The backend is the source of truth for this — a client value is
// a convenience, never a permission (guardrail: enforce the hierarchy server-side).
export type AuthRole = 'participant' | 'organizer' | 'organization'

export type AuthUser = {
  id: string
  phone: string
  name: string
  surname: string
  role: AuthRole
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  /** Commit a fresh session (called from useLogin / useRegister on success). */
  setSession: (session: { token: string; user: AuthUser }) => void
  /** Drop the session — log out, or an interceptor 401. */
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
    }),
    { name: 'camply-auth' },
  ),
)
