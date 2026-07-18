/*
  The camp/group mock that used to live here is GONE — the participant home now
  composes live data (useMyCamps + useMyGroup in lib/campHome.ts).

  What remains is deliberately NOT a placeholder: the SOS reason categories are
  FIXED app config (not something an organizer types per camp), so hardcoding them
  is correct. Only the responder/location would become live data at alert time —
  and that belongs to the SOS flow, not here.
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
