import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  CLIENT state — the auth SESSION identity. The real session is an httpOnly cookie
  the browser holds; this store only caches WHO you are (for rendering + route
  guards). Persisted, so a logged-in identity survives reload / PWA relaunch; the
  cookie is re-validated on boot via GET /auth/me (useCurrentUser).

  Editable profile fields (email, socials) live in useProfileStore; server-authored
  camp data (membership, points) stays in React Query. Keeping them apart is what
  makes each swap to a real endpoint local.
*/
export type AuthRole = 'participant' | 'organizer' | 'manager' | 'organization'

export type AuthUser = {
  id: string
  // Null for the organization super-admin, which logs in by username, not phone.
  phone: string | null
  name: string
  surname: string
  role: AuthRole
  cityId: string | null
  age: number | null
  photo: string | null
  profileComplete: boolean
}

type AuthState = {
  user: AuthUser | null
  /** Commit the identity (from login / complete-profile / boot revalidation). */
  setUser: (user: AuthUser) => void
  /** Drop the session — logout, or an interceptor 401. */
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    { name: 'camply-auth' },
  ),
)
