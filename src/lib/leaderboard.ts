/*
  This module is the PURE leaderboard view model — the ranking math and the shapes
  the screen renders. The data contract (Leaderboard/LeaderboardGroup/…) and the
  fetch/mutation hooks migrated to api/services/leaderboard.service.ts +
  api/queries/leaderboard.queries.ts (see CLAUDE.md). We re-export the contract
  types below so existing type-only importers keep working.
*/
export type {
  Leaderboard,
  LeaderboardGroup,
  LeaderboardBreakdown,
} from '../api/services/leaderboard.service'
import type { Leaderboard, LeaderboardBreakdown } from '../api/services/leaderboard.service'

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
