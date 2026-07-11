import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  Which announcements this participant has read. Read-state is CLIENT-owned (a
  per-user convenience, not organizer-visible in v1) so it lives in Zustand, not
  React Query — mixing it into the shared, cacheable announcement content would
  make every "mark read" invalidate that cache. Persisted so it survives a reload /
  PWA relaunch. Seam: if cross-device read-sync is ever wanted, this graduates to a
  server field behind the same markRead() call.
*/
type ReadsState = {
  readIds: string[]
  markRead: (id: string) => void
}

export const useAnnouncementReads = create<ReadsState>()(
  persist(
    (set) => ({
      readIds: [],
      markRead: (id) => set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
    }),
    { name: 'camply-announcement-reads' },
  ),
)

/** Reactive: is THIS announcement read? Re-renders when the read-set changes. */
export function useIsAnnouncementRead(id: string): boolean {
  return useAnnouncementReads((s) => s.readIds.includes(id))
}

/** Reactive unread count for a set of announcement ids. */
export function useUnreadCount(ids: string[]): number {
  return useAnnouncementReads((s) => {
    const read = new Set(s.readIds)
    return ids.reduce((n, id) => (read.has(id) ? n : n + 1), 0)
  })
}
