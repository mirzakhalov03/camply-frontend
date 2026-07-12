/*
  The query-key REGISTRY — every cached resource gets its React Query key from a
  factory here. One place to see the whole key namespace (no collisions) and, more
  importantly, one place that defines the INVALIDATION hierarchy.

  Camp data is camp-scoped and NESTED under `campKeys.all(campId)`, so a single
  `invalidateQueries({ queryKey: campKeys.all(id) })` correctly refreshes every
  query for that camp (roster, schedule, leaderboard, map, chat) — e.g. when the
  organizer edits the camp, or the user switches camps. Narrower keys invalidate
  just their slice.

  Rule: never inline a `['...']` array in a hook — pull the key from a factory here.
*/

/** Auth is global (not camp-scoped), so it lives at the root. */
export const authKeys = {
  me: ['auth', 'me'] as const,
}

/*
  Weather is DEVICE-scoped, not camp-scoped: it reads the user's current location,
  so it's the same across every camp they run and lives at the root, not under a
  campId.
*/
export const weatherKeys = {
  current: ['weather', 'current'] as const,
}

/*
  Organizer-scoped, CROSS-camp resources — the back-office dashboard reads that
  span every camp the organizer runs, so they sit ABOVE any single campId (unlike
  campKeys below). A single-camp view still reads camp-scoped keys from campKeys.
*/
export const organizerKeys = {
  all: ['organizer'] as const,
  /** The organizer's camps list (dashboard cards). */
  camps: ['organizer', 'camps'] as const,
  /** A single camp's organizer-side meta (detail header). */
  camp: (campId: string) => ['organizer', 'camps', campId] as const,
  /** Header totals: participants / active camps / groups across all camps. */
  summary: ['organizer', 'summary'] as const,
  /** Active SOS / help requests surfaced on the dashboard, safety-first. */
  helpRequests: ['organizer', 'help'] as const,
  /** The organizer team + pending invites (org-level, spans camps). */
  team: ['organizer', 'team'] as const,
  /** The organizer chat (two channels), org-level. */
  orgChat: ['organizer', 'chat'] as const,
}

/*
  The organization ADMIN surface (/admin) managing organizer accounts. Distinct
  from `organizerKeys` above (which is a logged-in organizer's own back-office):
  this is the super-admin's list of all organizers it creates/deactivates.
*/
export const adminOrganizerKeys = {
  all: ['adminOrganizers'] as const,
  list: () => [...adminOrganizerKeys.all, 'list'] as const,
}

/*
  The org admin's CAMPS list — every camp across every organizer (a different
  projection than organizerKeys, which is one organizer's own camps). Mock-backed
  today via adminCamps.service.ts; the key is ready for the real /camps endpoint.
*/
export const adminCampKeys = {
  all: ['adminCamps'] as const,
  list: () => [...adminCampKeys.all, 'list'] as const,
}

/** A pending organizer team invite, looked up by its token (pre-auth). */
export const inviteKeys = {
  all: ['invite'] as const,
  detail: (token: string) => [...inviteKeys.all, token] as const,
}

/** Everything owned by / read within a single camp. */
export const campKeys = {
  all: (campId: string) => ['camp', campId] as const,
  home: (campId: string) => [...campKeys.all(campId), 'home'] as const,
  roster: (campId: string) => [...campKeys.all(campId), 'roster'] as const,
  groups: (campId: string) => [...campKeys.all(campId), 'groups'] as const,
  schedule: (campId: string) => [...campKeys.all(campId), 'schedule'] as const,
  leaderboard: (campId: string) => [...campKeys.all(campId), 'leaderboard'] as const,
  /** Live location pins — high-frequency; updated via setQueryData, not refetch. */
  mapPins: (campId: string) => [...campKeys.all(campId), 'map'] as const,
  /** Chat is per-group within a camp. */
  chat: (campId: string, groupId: string) => [...campKeys.all(campId), 'chat', groupId] as const,
  /** All announcements for a camp — one invalidation refreshes the feed. */
  announcements: (campId: string) => [...campKeys.all(campId), 'announcements'] as const,
  /** A single announcement (detail screen + push deep-link). */
  announcement: (campId: string, id: string) =>
    [...campKeys.all(campId), 'announcements', id] as const,
}
