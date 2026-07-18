import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { announcementsService, type NewAnnouncement } from '../services/announcements.service'
import { campKeys } from '../queryKeys'

/*
  The announcements QUERIES — the React layer over announcementsService. Components
  call these hooks only; they never touch the service or axios. Both are reads →
  both useQuery, keyed from the registry (never an inline array) so a future
  realtime "announcement:new" event can invalidate campKeys.announcements(campId)
  and every subscribed screen refetches for free.
*/

/** The whole feed for a camp (pinned-first, then newest — the server's order). */
export function useAnnouncements(campId: string) {
  return useQuery({
    queryKey: campKeys.announcements(campId),
    queryFn: () => announcementsService.list(campId),
    // An unresolved camp would request /camps//announcements — hold until known.
    enabled: Boolean(campId),
  })
}

/** One announcement — powers the detail screen and push deep-links. */
export function useAnnouncement(id: string, campId: string) {
  return useQuery({
    queryKey: campKeys.announcement(campId, id),
    queryFn: () => announcementsService.getById(campId, id),
  })
}

/*
  The WRITE side — the organizer posts an announcement. On success it invalidates
  the camp's announcements key, so the organizer's Announcements tab AND the
  participant's feed (both keyed campKeys.announcements) refetch and show it.
*/
export function useCreateAnnouncement(campId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewAnnouncement) => announcementsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: campKeys.announcements(campId) }),
  })
}
