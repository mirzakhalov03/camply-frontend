import { helpRequestsMock } from '@/lib/mocks/mockHelpRequests'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

/*
  The help-requests SERVICE — organizer-facing SOS. This is the READ side of the
  same alert the participant fires from their SOS flow (useSos.ts): the participant
  writes the alert, the organizer reads + resolves it. One entity, two sides of the
  hierarchy — enforced server-side (guardrail: SOS is sacred).

  Today list() returns mock data. In production these arrive over the realtime
  bridge (setQueryData into organizerKeys.helpRequests), not a poll — the service
  is only the initial fetch + the resolve mutation.
*/

/** Why the participant needs help — the same fixed set the SOS flow offers. */
export type HelpReason = 'medical' | 'lost' | 'unsafe' | 'other'

export type HelpRequest = {
  id: string
  campId: string
  participantId: string
  participantName: string
  initials: string
  /** Participant's avatar tile color (runtime data, applied inline). */
  avatarColor: string
  reason: HelpReason
  /** Group the participant belongs to, for context on the alert. */
  groupName: string
  /** Last-known zone / area, e.g. "Lake trail". */
  zone: string
  /** ISO 8601 UTC — the UI formats "3 min ago" per language. */
  createdAt: string
  status: 'active' | 'resolved'
}

export const helpRequestsService = {
  /** Active (unresolved) requests across the organizer's camps, newest first. */
  listActive: async (): Promise<HelpRequest[]> => {
    // return (await axiosInstance.get<HelpRequest[]>('/organizer/help?status=active')).data
    return helpRequestsMock
      .filter((h) => h.status === 'active')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  /** Mark a request resolved. Mutates the mock today; the commented line is the
      real call. One resolve updates every surface that reads this domain (the
      dashboard banner AND the profile card), since they share the query key. */
  resolve: async (id: string): Promise<void> => {
    // await axiosInstance.post(`/organizer/help/${id}/resolve`)
    const found = helpRequestsMock.find((h) => h.id === id)
    if (found) found.status = 'resolved'
  },
}
