import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  CLIENT state — WHO you are. The credential itself is the backend's httpOnly
  session cookie (not readable by JS), so the store no longer holds a token; it
  only mirrors the identity the backend returns at login for instant UI use.
  Persisted so the identity survives a reload; the cookie keeps the session live.

  This holds WHO you are — not your editable profile fields (name, city, socials);
  those stay in useProfileStore. Server-authored data (membership, points) stays
  in React Query. Keeping the three apart is what makes each swap to a real
  endpoint local.
*/

// The role hierarchy (Context.md): organization super-admin > organizer >
// participant. The backend is the source of truth — a client value is a
// convenience, never a permission (guardrail: enforce the hierarchy server-side).
export type AuthRole = 'participant' | 'organizer' | 'organization'

export type AuthUser = {
  id: string
  phone: string
  name: string
  surname: string
  role: AuthRole
}

type AuthState = {
  user: AuthUser | null
  /** Commit a fresh session (called from useLogin / useRegister on success). */
  setSession: (session: { user: AuthUser }) => void
  /** Drop the identity — log out, or a 401 from the response interceptor. */
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setSession: ({ user }) => set({ user }),
      clear: () => set({ user: null }),
    }),
    { name: 'camply-auth' },
  ),
)
