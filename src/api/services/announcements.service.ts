import { axiosInstance } from '../axiosInstance'

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

/** Server returns the list pinned-first, then newest. Mirror that here. */
function sortForFeed(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.createdAt.localeCompare(a.createdAt)
  })
}

/** What the organizer submits to post an announcement (server sets id + createdAt). */
export type NewAnnouncement = Omit<Announcement, 'id' | 'createdAt'>

export const announcementsService = {
  list: async (campId: string): Promise<Announcement[]> => {
    return sortForFeed(
      (await axiosInstance.get<Announcement[]>(`/camps/${campId}/announcements`)).data,
    )
  },

  getById: async (campId: string, id: string): Promise<Announcement> => {
    return (await axiosInstance.get<Announcement>(`/camps/${campId}/announcements/${id}`)).data
  },

  /** Organizer posts an announcement. Returns the created record. */
  create: async (input: NewAnnouncement): Promise<Announcement> => {
    return (await axiosInstance.post<Announcement>(`/camps/${input.campId}/announcements`, input))
      .data
  },
}
