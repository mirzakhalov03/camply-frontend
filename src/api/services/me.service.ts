import { axiosInstance } from '../axiosInstance'

/*
  The ME service — the caller's own cross-camp reads. This is the boundary that
  answers "which camp am I in", which every other participant query depends on.
  No React here.
*/

/*
  A camp as the PARTICIPANT sees it. Same entity as the organizer's OrganizerCamp
  but WITHOUT the roster counts (participantCount, groupCount, checkinPct) — those
  are back-office totals, not participant-facing.
*/
export type ParticipantCamp = {
  id: string
  name: string
  location: string
  /** Human date range, formatted server-side, e.g. "Jul 6 – Jul 19". */
  dateRange: string
  startsAt: string
  endsAt: string
  /** Never 'draft' or 'archived' — the server filters both out of this list. */
  status: 'active' | 'upcoming'
  coverImage: string | null
  /** Day N of M — 0 until the camp starts. */
  dayCurrent: number
  dayTotal: number
}

export const meService = {
  /*
    Every published, not-yet-finished camp the caller participates in, most
    relevant first (running now, then soonest upcoming). An empty array is normal:
    it means the participant hasn't been added to a live camp yet.
  */
  camps: async (): Promise<ParticipantCamp[]> =>
    (await axiosInstance.get<ParticipantCamp[]>('/me/camps')).data,
}
