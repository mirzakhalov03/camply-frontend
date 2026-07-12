import { axiosInstance } from '../axiosInstance'

/*
  The leaderboard SERVICE — the backend boundary for group standings. The types here
  are the DATA CONTRACT (deliberately "dumb": raw scores, no ranks/trend — those are
  computed client-side by deriveLeaderboard in lib/leaderboard.ts). No React here.

  This module supersedes the fetch/mutation that used to live in lib/leaderboard.ts
  (the mock-era boundary); the pure ranking math stays there.
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
  /** Group photo URL; falls back to the initials tile. */
  photo?: string
  /** Current total points. */
  score: number
  /** Score at the last ranking snapshot — drives the trend arrow. */
  previousScore: number
  breakdown: LeaderboardBreakdown
}

export type Leaderboard = {
  /** Scoring period label, e.g. "Week 1". Not surfaced yet (future period selector). */
  periodLabel: string
  groups: LeaderboardGroup[]
  /** The current participant's group id — used to mark "you". Null if unassigned. */
  currentGroupId: string | null
}

export type PointCategory = 'activities' | 'attendance' | 'challenges'

export const leaderboardService = {
  get: async (campId: string): Promise<Leaderboard> =>
    (await axiosInstance.get<Leaderboard>(`/camps/${campId}/leaderboard`)).data,

  adjust: async (
    campId: string,
    groupId: string,
    delta: number,
    category: PointCategory,
  ): Promise<void> => {
    await axiosInstance.post(`/camps/${campId}/leaderboard/${groupId}/points`, { delta, category })
  },
}
