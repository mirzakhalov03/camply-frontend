import { useQuery } from '@tanstack/react-query'
import { membershipMock } from '@/lib/mocks/mockMembership'
// import { api } from './api' // ← enable when the backend endpoint exists

/*
  The DATA CONTRACT for a participant's camp membership — the pieces the ORGANIZER
  and backend own, not the user: which tribe they're in, their role, and the
  gamification stats. Components depend on this shape, never on where it comes
  from. This mirrors campHome.ts on purpose: same seam, same swap story.
*/
export type Membership = {
  tribe: {
    /** Proper noun — stays literal in every language, like city names. */
    name: string
    emoji: string
  }
  /** Semantic key, localized in the UI (see t.profile.roles). */
  role: 'participant'
  stats: {
    groupRank: string // e.g. '2nd' — ordinal, organizer-computed
    activities: number
    points: number
  }
}

/*
  The single data boundary for membership. Today it returns the mock payload;
  once the organizer dashboard + backend exist, swap the body for the commented
  `api.get` line and NOTHING in the UI changes — the whole point of routing every
  read through one function instead of importing the mock directly.
*/
export async function fetchMembership(): Promise<Membership> {
  // return api.get<Membership>('/me/membership')
  return membershipMock
}

/*
  React Query hook for the membership payload. Cached by `queryKey`, so any
  component can call useMembership() and share one request + one cache.
*/
export function useMembership() {
  return useQuery({ queryKey: ['membership'], queryFn: fetchMembership })
}
