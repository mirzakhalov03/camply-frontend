import type { Announcement } from '../api/services/announcements.service'

/*
  Mock announcement feed — stands in for the organizer's posts until the backend
  exists. The service's fetchers are the seam where this gets swapped for real API
  calls. Times are ISO UTC (the contract); the UI turns them into "20 min ago" per
  language. Ordering is enforced by the service (pinned-first), not here.
*/

// Fresh-looking timestamps: N minutes before "now", as ISO UTC.
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

export const announcementsMock: Announcement[] = [
  {
    id: 'a1',
    campId: 'current',
    body: 'Bus to Chimgan leaves at 7:00 sharp. Be at the main gate 10 minutes early.',
    scope: { kind: 'camp' },
    author: { id: 'o1', name: 'Jasur Karimov', role: 'organizer', avatarColor: '#0f6b4f' },
    pinned: true,
    createdAt: minutesAgo(20),
  },
  {
    id: 'a2',
    campId: 'current',
    title: 'Quiz results are in!',
    body: 'Great work in the quiz today, Pine Wolves! 🏆 You climbed to 2nd place — keep it up tomorrow.',
    scope: { kind: 'group', groupId: 'g1', groupName: 'Pine Wolves' },
    author: { id: 'o2', name: 'Dilnoza Aliyeva', role: 'organizer', avatarColor: '#5aa9c4' },
    pinned: false,
    createdAt: minutesAgo(140),
  },
  {
    id: 'a3',
    campId: 'current',
    body: 'Dinner moves to the Dining Hall tonight because of the weather. Same time, 19:00.',
    scope: { kind: 'camp' },
    author: { id: 'o1', name: 'Jasur Karimov', role: 'organizer', avatarColor: '#0f6b4f' },
    pinned: false,
    createdAt: minutesAgo(60 * 26),
  },
]
