import type { Leaderboard, LeaderboardGroup } from './leaderboard'
import { CAMP_GROUPS } from './groups'

/*
  The ONLY hardcoded leaderboard content. Group IDENTITY (name, color) is NOT
  duplicated here — it's spread from CAMP_GROUPS so there's exactly one source of
  truth for group names. This file owns only the leaderboard-specific numbers
  (scores + breakdown), keyed by the canonical group id. Shaped exactly like the
  future API response (`Leaderboard`), so fetchLeaderboard() swaps in one line.

  Note what is NOT here: no rank, no "you", no trend. Those are DERIVED
  (leaderboard.ts) — the backend only sends raw scores and who the camper is.
*/
type GroupScores = Omit<LeaderboardGroup, 'id' | 'name' | 'color'>

const SCORES: Record<string, GroupScores> = {
  foxes: {
    score: 1320,
    previousScore: 1180,
    breakdown: { activities: 560, attendance: 480, challenges: 280 },
  },
  wolves: {
    score: 1280,
    previousScore: 1190,
    breakdown: { activities: 520, attendance: 500, challenges: 260 },
  },
  hawks: {
    score: 1150,
    previousScore: 1240,
    breakdown: { activities: 480, attendance: 440, challenges: 230 },
  },
  blazers: {
    score: 980,
    previousScore: 980,
    breakdown: { activities: 400, attendance: 380, challenges: 200 },
  },
  otters: {
    score: 870,
    previousScore: 760,
    breakdown: { activities: 360, attendance: 320, challenges: 190 },
  },
  eagles: {
    score: 640,
    previousScore: 820,
    breakdown: { activities: 280, attendance: 240, challenges: 120 },
  },
}

export const leaderboardMock: Leaderboard = {
  periodLabel: 'Week 1',
  // The logged-in participant's group. Real value comes from their membership,
  // not from the board — which is why it lives here, separate from `groups`.
  currentGroupId: 'wolves',
  groups: CAMP_GROUPS.map((g) => {
    // Loud failure > silent NaN: TS doesn't flag a missing key here (indexed
    // access isn't undefined-checked), so guard it — a group added to
    // CAMP_GROUPS without scores would otherwise render as broken ranks/bars.
    const scores = SCORES[g.id]
    if (!scores) throw new Error(`mockLeaderboard: no scores for group '${g.id}'`)
    return { ...g, ...scores }
  }),
}
