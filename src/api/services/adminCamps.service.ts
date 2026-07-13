import { adminCampsMock } from '@/lib/mocks/mockAdminCamps'
// import { axiosInstance } from '../axiosInstance' // ← enable when GET /camps exists

/*
  The admin CAMPS service — the backend boundary for the organization's org-wide
  camps list. The types here are the DATA CONTRACT the backend will fill; the UI
  depends on these shapes, never on where the data comes from.

  BACKEND STATUS: there is no /camps endpoint yet (no Camp model server-side). Today
  list() returns mock data with the real axios call commented out — the same
  mock→real seam as camps.service.ts / announcements.service.ts. When the endpoint
  lands, this ONE function body changes; the UI does not.
*/

/** Camp lifecycle (Context.md §6). `archived` is a past camp kept for history. */
export type AdminCampStatus = 'active' | 'upcoming' | 'draft' | 'archived'

/** One camp as the ORGANIZATION admin lists it (across all organizers). */
export type AdminCamp = {
  id: string
  name: string
  /** The organizer who created/runs it — the org-view attribution. */
  organizerName: string
  location: string
  /** Human date range, already formatted server-side, e.g. "Jul 6 – Jul 19". */
  dateRange: string
  status: AdminCampStatus
  participantCount: number
}

export const adminCampsService = {
  /** Every camp across every organizer, newest/active first (server-ordered later). */
  list: async (): Promise<AdminCamp[]> => {
    // return (await axiosInstance.get<{ camps: AdminCamp[] }>('/camps')).data.camps
    return adminCampsMock
  },
}
