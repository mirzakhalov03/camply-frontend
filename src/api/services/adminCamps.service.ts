import { axiosInstance } from '../axiosInstance'

/*
  The admin CAMPS service — the backend boundary for the organization's org-wide
  camps list. The types here are the DATA CONTRACT; the UI depends on these shapes,
  never on where the data comes from.

  Live against GET /api/camps since 2026-07-20. The endpoint is organization-only
  (a manager gets 403 and uses /organizer/camps instead) and returns camps scoped to
  the caller's own organization, ordered active → upcoming → draft → archived.
*/

/** Camp lifecycle (Context.md §6). `archived` is a past camp kept for history. */
export type AdminCampStatus = 'active' | 'upcoming' | 'draft' | 'archived'

/** One camp as the ORGANIZATION admin lists it (across all its managers). */
export type AdminCamp = {
  id: string
  name: string
  /** The manager who created/runs it — the org-view attribution. '—' if deleted. */
  organizerName: string
  location: string
  /** Human date range, already formatted server-side, e.g. "Jul 6 – Jul 19". */
  dateRange: string
  status: AdminCampStatus
  participantCount: number
}

export const adminCampsService = {
  /** Every camp in the organization, active first. Ordering is server-owned. */
  list: async (): Promise<AdminCamp[]> =>
    (await axiosInstance.get<{ camps: AdminCamp[] }>('/camps')).data.camps,
}
