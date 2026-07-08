import { announcementsMock } from '../../lib/mockAnnouncements'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

/*
  The announcements SERVICE — the backend boundary for the participant feed. The
  types here are the DATA CONTRACT the organizer dashboard + backend will fill; the
  UI depends on these shapes, never on where the data comes from. No React here.

  Today the fetchers return mock data with the real axios call commented out — the
  same mock→real seam as lib/campHome.ts. Flipping to the real API touches ONLY
  these two functions.
*/

/** Where an announcement was sent: the whole camp, or one group. */
export type AnnouncementScope =
  { kind: 'camp' } | { kind: 'group'; groupId: string; groupName: string }

/** The organizer who posted it (a join to the organizer record, server-side). */
export type AnnouncementAuthor = {
  id: string
  name: string
  role: 'organizer' | 'organization'
  avatarColor: string
  photo?: string | null
}

export type Announcement = {
  id: string
  campId: string
  title?: string
  body: string
  scope: AnnouncementScope
  author: AnnouncementAuthor
  pinned: boolean
  /** ISO 8601 UTC — the UI formats it per language; never store a relative string. */
  createdAt: string
  updatedAt?: string
}

/*
  No camp-switching plumbing exists yet (useCampHome() takes no id either), so a
  single current-camp id stands in. When camps become switchable this comes from
  camp context — the queries already key by campId, so nothing else changes.
*/
export const CURRENT_CAMP_ID = 'current'

/** Server returns the list pinned-first, then newest. Mirror that here. */
function sortForFeed(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export const announcementsService = {
  list: async (_campId: string): Promise<Announcement[]> => {
    // return (await axiosInstance.get<Announcement[]>(`/camps/${_campId}/announcements`)).data
    return sortForFeed(announcementsMock)
  },

  getById: async (_campId: string, id: string): Promise<Announcement> => {
    // return (await axiosInstance.get<Announcement>(`/camps/${_campId}/announcements/${id}`)).data
    const found = announcementsMock.find((a) => a.id === id)
    if (!found) throw new Error('Announcement not found')
    return found
  },
}
