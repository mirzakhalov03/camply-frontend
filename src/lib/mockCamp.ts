import type { CampHome } from './campHome'

/*
  Mock backing store — stands in for the database until the backend exists. This
  is the ONLY file that hardcodes example content; `fetchCampHome()` in campHome.ts
  is the seam where it gets swapped for a real API call. Everything the organizer
  will eventually author (camp, schedule, announcements, group) lives in one
  object shaped by the CampHome contract, so TypeScript guarantees the mock and
  the real response stay identical in shape.
*/
export const campHomeMock: CampHome = {
  camp: {
    name: 'Yoshlar Summer Camp 2026',
    location: 'Chimgan Mountains',
    dateRange: 'Jul 6 – Jul 19',
    dayCurrent: 6,
    dayTotal: 14,
    // Test cover from public/. Later this is a URL the organizer uploads.
    coverImage: '/camp-cover.jpg',
  },
  group: {
    name: 'Pine Wolves',
    memberCount: 8,
    members: [
      { initials: 'AR', color: '#5aa9c4' },
      { initials: 'BT', color: '#2f8f6b' },
      { initials: 'DK', color: '#e0982a' },
    ],
  },
  unreadChat: 3,
}

/*
  SOS is different from the content above: the reason categories are FIXED app
  config (not something an organizer types per camp), so hardcoding them is
  correct, not a placeholder. Only the responder/location would become live data
  at alert time — that belongs to the SOS flow, not the home refactor.
*/
export type SosReasonKey = 'medical' | 'lost' | 'unsafe' | 'other'

export type SosReason = {
  key: SosReasonKey
  icon: string
}

export const sosReasons: SosReason[] = [
  { key: 'medical', icon: '🩹' },
  { key: 'lost', icon: '🧭' },
  { key: 'unsafe', icon: '⚠️' },
  { key: 'other', icon: '❓' },
]

export const sosContext = {
  /** Where the participant is — shared live with the alert. */
  location: 'Birch 4 cabin',
  team: 'Organizer team',
  leaderName: 'Sardor A.',
  responder: {
    name: 'Madina Yusupova',
    initials: 'MY',
    /** Countdown shown on the active screen, in seconds (5:00). */
    etaSeconds: 300,
  },
}
