import { useQuery } from '@tanstack/react-query'
import { campHomeMock } from '@/lib/mocks/mockCamp'
// import { api } from './api' // ← enable when the backend endpoint exists

/*
  The DATA CONTRACT for the participant home. These types describe the shape the
  ORGANIZER's data will fill in — the camp name/dates, the schedule they build,
  the announcements they post, the group they assign. Components depend on these
  shapes, never on where the data actually comes from.
*/
export type GroupMember = {
  initials: string
  /** Avatar background — runtime data, so consumers apply it as an inline style. */
  color: string
}

export type CampHome = {
  camp: {
    name: string
    location: string
    dateRange: string
    dayCurrent: number
    dayTotal: number
    /** Cover photo URL (mock now; organizer-uploaded later). */
    coverImage: string
  }
  group: {
    name: string
    memberCount: number
    members: GroupMember[]
  }
  /** Unread group-chat messages — drives the Chat tab badge. */
  unreadChat: number
}

/*
  The single data boundary for the participant home. Today it returns the mock
  payload the prototype illustrated. Once the organizer dashboard + backend exist,
  the organizer's camp/schedule/announcements are served from here — swap the body
  for the commented `api.get` line and NOTHING in the UI changes. This is why no
  component imports mock data directly: they all flow through this one function.
*/
export async function fetchCampHome(): Promise<CampHome> {
  // return api.get<CampHome>('/camps/current/home')
  return campHomeMock
}

/*
  React Query hook for the home payload. React Query caches by `queryKey`, so
  several components can each call useCampHome() and still share ONE network
  request and ONE cache — no prop-drilling, no double fetch. That's exactly how
  HomeScreen (content) and the bottom-nav badge (unread count) both read it.
*/
export function useCampHome() {
  return useQuery({ queryKey: ['campHome'], queryFn: fetchCampHome })
}
