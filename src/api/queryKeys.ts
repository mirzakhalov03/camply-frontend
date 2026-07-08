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
}
