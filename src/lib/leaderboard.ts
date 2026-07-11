import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { leaderboardMock } from './mockLeaderboard'
// import { api } from './api' // ← enable when the backend endpoint exists

/*
  ============================================================================
  DATA CONTRACT — the raw shape the backend + organizer dashboard will return.
  ============================================================================
  This is deliberately "dumb" data: groups with scores, and who the current
  participant is. It carries NO ranks, NO "you" flag, NO trend — because a real
  API wouldn't. All of that is computed by `deriveLeaderboard()` below. Keeping
  the raw shape backend-honest is what makes the future swap a one-liner.
*/
export type LeaderboardBreakdown = {
  activities: number
  attendance: number
  challenges: number
}

export type LeaderboardGroup = {
  id: string
  name: string
  /** Organizer-assigned group color — runtime data, applied as an inline style. */
  color: string
  /** Group photo URL (organizer/backend-set later); falls back to the initials tile. */
  photo?: string
  /** Current total points. */
  score: number
  /** Score at the last ranking snapshot — drives the trend arrow. */
  previousScore: number
  breakdown: LeaderboardBreakdown
}

export type Leaderboard = {
  /** Scoring period label, e.g. "Week 1". Organizer/backend owned. Part of the
      API shape; not surfaced in the UI yet (kept for a future period selector). */
  periodLabel: string
  groups: LeaderboardGroup[]
  /** The current participant's group id — used to mark "you". Null if unassigned. */
  currentGroupId: string | null
}

/*
  ============================================================================
  VIEW MODEL — what the screen actually renders, produced by deriveLeaderboard.
  ============================================================================
*/
export type Trend = { direction: 'up' | 'down' | 'same'; delta: number }

export type RankedGroup = {
  id: string
  rank: number // 1-based, by score descending
  name: string
  color: string
  /** Group photo URL if the group has one; the avatar falls back to `initials`. */
  photo?: string
  initials: string
  score: number
  /** Per-category points — shown on the organizer's Leaderboard tab. */
  breakdown: LeaderboardBreakdown
  isYou: boolean
  /** score / topScore * 100 — the progress bar width. */
  barPct: number
  trend: Trend
}

export type LeaderboardView = {
  rows: RankedGroup[]
  /** The participant's group, if it's on the board. Drives the spotlight card. */
  you: RankedGroup | null
  /** The group one place above "you" — for the "X pts behind {name}" line. */
  nextAhead: RankedGroup | null
}

/** First letters of up to two words: "Pine Wolves" → "PW". */
function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/*
  Pure ranking math — no React, no fetching, no styling. Give it the raw
  `Leaderboard`, get back the ranked view. Because it's pure, it's trivial to
  unit-test and it never has to change when the data source becomes a real API.

  Trend is rank movement, not raw points: we rank the groups by their CURRENT
  score and again by their PREVIOUS score, then compare each group's position.
  Moving from 4th to 2nd is "▲ 2" even if several groups gained points.
*/
export function deriveLeaderboard(data: Leaderboard): LeaderboardView {
  const byScore = [...data.groups].sort((a, b) => b.score - a.score)
  const byPrev = [...data.groups].sort((a, b) => b.previousScore - a.previousScore)
  const prevRankOf = new Map(byPrev.map((g, i) => [g.id, i]))
  const topScore = byScore[0]?.score ?? 0

  const rows: RankedGroup[] = byScore.map((g, i) => {
    const movement = (prevRankOf.get(g.id) ?? i) - i // + = climbed, − = dropped
    return {
      id: g.id,
      rank: i + 1,
      name: g.name,
      color: g.color,
      photo: g.photo,
      initials: initialsOf(g.name),
      score: g.score,
      breakdown: g.breakdown,
      isYou: g.id === data.currentGroupId,
      barPct: topScore > 0 ? Math.round((g.score / topScore) * 100) : 0,
      trend: {
        direction: movement > 0 ? 'up' : movement < 0 ? 'down' : 'same',
        delta: Math.abs(movement),
      },
    }
  })

  const you = rows.find((r) => r.isYou) ?? null
  // The group directly above you: rank N means array index N-1, so "above" is N-2.
  const nextAhead = you && you.rank > 1 ? (rows[you.rank - 2] ?? null) : null

  return { rows, you, nextAhead }
}

/*
  The single data boundary. Today returns the mock; when the backend lands, swap
  the body for the commented `api.get` line and NOTHING downstream changes —
  deriveLeaderboard and every component keep working untouched.
*/
export async function fetchLeaderboard(): Promise<Leaderboard> {
  // return api.get<Leaderboard>('/camps/current/leaderboard')
  return leaderboardMock
}

/*
  One key for the leaderboard cache, defined once so the read hook and the write
  mutation below can't drift. (This lib module predates the api/queryKeys registry;
  it migrates there when the endpoint lands — see CLAUDE.md.)
*/
const LEADERBOARD_KEY = ['leaderboard'] as const

/*
  React Query hook. Caches by queryKey so any component can call useLeaderboard()
  and share one request + one cache — same pattern as useCampHome().
*/
export function useLeaderboard() {
  return useQuery({ queryKey: LEADERBOARD_KEY, queryFn: fetchLeaderboard })
}

/*
  The WRITE side — the organizer awards / deducts a group's points. This is the
  shared-domain payoff: it writes the SAME ['leaderboard'] cache the participant
  Ranks screen reads, so a running participant board would re-rank live. The update
  is optimistic (onMutate → setQueryData); the commented mutationFn is where the
  real POST lands, and deriveLeaderboard recomputes ranks + trend from the new score.
*/
export function useAdjustGroupPoints() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_vars: { groupId: string; delta: number }) => {
      // await api.post(`/camps/current/leaderboard/${_vars.groupId}/points`, { delta: _vars.delta })
    },
    onMutate: ({ groupId, delta }) => {
      qc.setQueryData<Leaderboard>(LEADERBOARD_KEY, (prev) =>
        prev
          ? {
              ...prev,
              groups: prev.groups.map((g) =>
                g.id === groupId ? { ...g, score: Math.max(0, g.score + delta) } : g,
              ),
            }
          : prev,
      )
    },
  })
}
