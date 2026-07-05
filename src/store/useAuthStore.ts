import { create } from 'zustand'

// Example of CLIENT state — data the UI owns, not the server. Auth session,
// theme, modal open/close, etc. belong here. Server data (users, posts…)
// should live in React Query, NOT in a store like this.
export type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthState = {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
