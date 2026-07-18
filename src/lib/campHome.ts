import { useMyCamps } from '@/api/queries/me.queries'
import { useMyGroup } from '@/api/queries/myGroup.queries'
import { paletteColor } from '@/utils/paletteColor'

/*
  The DATA CONTRACT for the participant home. These types describe the shape the
  ORGANIZER's data fills in — the camp name/dates they set, the group they assign.
  Components depend on these shapes, never on where the data actually comes from.

  NOTE: this module is no longer a mock seam — it's a COMPOSER over two live
  api/queries hooks. It stays in lib/ only because 8 modules import these types;
  migrating it to @/hooks is a follow-up, not part of this change.
*/
export type GroupMember = {
  initials: string
  /** Resolved CSS color (a var(--color-*) reference or a hex) — used inline. */
  color: string
}

export type CampHome = {
  camp: {
    name: string
    location: string
    dateRange: string
    dayCurrent: number
    dayTotal: number
    /** Cover photo URL — organizer-uploaded, falling back to the bundled default. */
    coverImage: string
  }
  /** null when the organizer hasn't assigned this participant to a group yet. */
  group: {
    name: string
    memberCount: number
    members: GroupMember[]
  } | null
  /** Unread group-chat messages — drives the Chat tab badge. */
  unreadChat: number
}

/*
  Home is COMPOSED, not served by a bespoke endpoint.

  The camp comes from the SAME useMyCamps() cache the shell already resolved —
  React Query dedupes by queryKey, so this costs no extra request. That also keeps
  the participant off GET /camps/:id, whose shared projection still carries
  organizer roster counts (participantCount, checkinPct, …) they shouldn't receive.

  The group is its own query because it invalidates on a different cadence: an
  organizer reshuffling groups shouldn't force a refetch of camp metadata.

  unreadChat stays client-side — chat has no server-owned read state yet, so
  faking it into this payload would invent a contract the backend doesn't honor.
*/
export function useCampHome(campId: string) {
  const camps = useMyCamps()
  const group = useMyGroup(campId)

  const camp = camps.data?.find((c) => c.id === campId)
  const isPending = camps.isPending || group.isPending
  const isError = camps.isError || group.isError

  const data: CampHome | undefined =
    camp && !isPending
      ? {
          camp: {
            name: camp.name,
            location: camp.location,
            dateRange: camp.dateRange,
            dayCurrent: camp.dayCurrent,
            dayTotal: camp.dayTotal,
            coverImage: camp.coverImage ?? '/camp-cover.jpg',
          },
          group: group.data
            ? {
                name: group.data.name,
                memberCount: group.data.memberCount,
                members: group.data.members.map((m) => ({
                  initials: m.initials,
                  color: paletteColor(m.color),
                })),
              }
            : null,
          unreadChat: 0,
        }
      : undefined

  return { data, isPending, isError }
}
