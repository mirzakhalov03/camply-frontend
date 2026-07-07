import type { Membership } from './membership'

/*
  Mock backing store for membership — stands in for the database until the
  backend + organizer dashboard exist. This is the ONLY file that hardcodes the
  tribe/stats; fetchMembership() in membership.ts is the seam where it gets
  swapped for a real API call. TypeScript guarantees this mock and the real
  response stay identical in shape (both are `Membership`).
*/
export const membershipMock: Membership = {
  tribe: { name: 'Pine Wolves', emoji: '🌲' },
  role: 'participant',
  stats: {
    groupRank: '2nd',
    activities: 18,
    points: 320,
  },
}
