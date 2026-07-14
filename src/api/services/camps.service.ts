import { axiosInstance } from '../axiosInstance'

/*
  The camps SERVICE — the backend boundary for the ORGANIZER dashboard. The types
  here are the DATA CONTRACT the backend will fill; the UI depends on these shapes,
  never on where data comes from. No React here.

  Today the fetchers return mock data with the real axios call commented out — the
  same mock→real seam as announcements.service.ts / schedule.service.ts. Flipping to
  the real API touches ONLY the function bodies.

  This is the organizer's WRITE-side view of a camp (counts, check-in, status). The
  participant reads a different slice of the same camp via lib/campHome.ts — same
  underlying entity, different projection. Keeping both honest to one backend is the
  point of the shared domain layer.
*/

/** Camp lifecycle (Context.md §6). `archived` is a past camp kept for history. */
export type CampStatus = 'active' | 'upcoming' | 'draft' | 'archived'

/** One camp as the organizer dashboard lists it. */
export type OrganizerCamp = {
  id: string
  name: string
  location: string
  /** Human date range, already formatted server-side, e.g. "Jul 6 – Jul 19". */
  dateRange: string
  status: CampStatus
  participantCount: number
  groupCount: number
  organizerCount: number
  /** Percentage of participants currently checked in on-site (0–100). */
  checkinPct: number
  /** Day N of M — 0 until the camp starts. Drives the "Day 6 of 14" line. */
  dayCurrent: number
  dayTotal: number
  /** Cover image URL the organizer uploads; null falls back to a gradient. */
  coverImage?: string | null
}

/** Header totals spanning every camp the organizer runs. */
export type OrganizerSummary = {
  organizerName: string
  organizationName: string
  totalParticipants: number
  activeCamps: number
  totalGroups: number
  /** Unread organizer-team chat count (Chat tab badge). */
  unreadChat: number
  /** Participants currently on-site across active camps (Live map quick link). */
  onSite: number
}

/** Body for creating a new camp (organizer onboarding + camp-create flow). */
export type CreateCampBody = {
  name: string
  location: string
  /** ISO datetime */
  startsAt: string
  /** ISO datetime */
  endsAt: string
  capacity?: number
  languages?: ('en' | 'uz' | 'ru')[]
  coverImage?: string | null
}

export const campsService = {
  /** Every camp the organizer can open, newest/active first (server-ordered). */
  list: async (): Promise<OrganizerCamp[]> => {
    return (await axiosInstance.get<OrganizerCamp[]>('/organizer/camps')).data
  },

  /** Creates a new camp under the organizer's organization. */
  create: async (body: CreateCampBody): Promise<OrganizerCamp> => {
    return (await axiosInstance.post<OrganizerCamp>('/organizer/camps', body)).data
  },

  /** Cross-camp totals for the dashboard header + quick links. */
  summary: async (): Promise<OrganizerSummary> => {
    return (await axiosInstance.get<OrganizerSummary>('/organizer/summary')).data
  },

  /** A single camp (detail screen, slice 2). Throws if the id is unknown. */
  get: async (campId: string): Promise<OrganizerCamp> => {
    return (await axiosInstance.get<OrganizerCamp>(`/organizer/camps/${campId}`)).data
  },

  /** Edits a draft/published camp (used when the wizard's step 1 is revisited). */
  update: async (campId: string, body: Partial<CreateCampBody>): Promise<OrganizerCamp> => {
    return (await axiosInstance.patch<OrganizerCamp>(`/organizer/camps/${campId}`, body)).data
  },

  /** Flips a draft camp to published (wizard final step). */
  publish: async (campId: string): Promise<OrganizerCamp> => {
    return (await axiosInstance.post<OrganizerCamp>(`/organizer/camps/${campId}/publish`)).data
  },
}
