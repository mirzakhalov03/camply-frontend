import type { Leaderboard } from './leaderboard'

/*
  The ONLY hardcoded leaderboard content. This is throwaway test data — the real
  groups, scores, and colors come from the organizer dashboard + backend later.
  It is shaped EXACTLY like the future API response (see the `Leaderboard` type),
  so swapping it out is a one-line change in `fetchLeaderboard()`.

  Note what is NOT here: no rank, no "you", no trend. Those are DERIVED
  (leaderboard.ts) — the backend only sends raw scores and who the camper is.
*/
export const leaderboardMock: Leaderboard = {
  periodLabel: 'Week 1',
  // The logged-in participant's group. Real value comes from their membership,
  // not from the board — which is why it lives here, separate from `groups`.
  currentGroupId: 'wolves',
  groups: [
    {
      id: 'foxes',
      name: 'Summit Foxes',
      color: '#e0982a',
      score: 1320,
      previousScore: 1180,
      breakdown: { activities: 560, attendance: 480, challenges: 280 },
    },
    {
      id: 'wolves',
      name: 'Pine Wolves',
      color: '#0f6b4f',
      score: 1280,
      previousScore: 1190,
      breakdown: { activities: 520, attendance: 500, challenges: 260 },
    },
    {
      id: 'hawks',
      name: 'River Hawks',
      color: '#5aa9c4',
      score: 1150,
      previousScore: 1240,
      breakdown: { activities: 480, attendance: 440, challenges: 230 },
    },
    {
      id: 'blazers',
      name: 'Trail Blazers',
      color: '#c97b5a',
      score: 980,
      previousScore: 980,
      breakdown: { activities: 400, attendance: 380, challenges: 200 },
    },
    {
      id: 'otters',
      name: 'Lake Otters',
      color: '#3f9d8e',
      score: 870,
      previousScore: 760,
      breakdown: { activities: 360, attendance: 320, challenges: 190 },
    },
    {
      id: 'eagles',
      name: 'Camp Eagles',
      color: '#5f7d6a',
      score: 640,
      previousScore: 820,
      breakdown: { activities: 280, attendance: 240, challenges: 120 },
    },
  ],
}
