# Participant Ranks (Leaderboard) — Design

**Date:** 2026-07-08
**Surface:** Participant app (mobile-first PWA)
**Status:** Approved, ready for implementation plan

## Goal

Build the participant **Ranks** screen — the "Ranks" bottom-nav tab, currently a
`ComingSoon` stub. A camper opens it and sees the camp leaderboard: a green
podium header for the top three groups, a personal "Your standing" spotlight, the
full ranked list of groups (with trend vs. last week), and a card explaining how
points are earned.

The build is **frontend-only**, but the whole point of this task is that the
group names, scores, and rankings are throwaway mock data — the **real data will
come from the backend + organizer dashboard later.** So the architecture is
designed so that connecting real data means changing **one fetch function**, with
zero changes to derivation logic or components.

Faithful to the prototype's look, but rebuilt on our design tokens (dark-mode
safe), trilingual, with loading/empty/error states the prototype lacks, plus one
product-owner-approved addition (the "Your standing" card).

## Decisions

1. **"You" is derived, never stored.** The leaderboard data is just groups +
   scores. Which group is *mine* comes from `currentGroupId` (the participant's
   membership), matched against the groups at derive time. When real membership
   arrives, nothing about the board data changes. This is the single most
   important future-proofing choice.
2. **Three-layer split — data / derivation / presentation.** Raw shape lives in
   `lib/`, a pure `deriveLeaderboard()` produces the view model (ranks, trend,
   `isYou`, gap-to-next), and components only render. Backend swap touches the
   fetch only.
3. **Keep the "Your standing" spotlight card.** Under the podium: my group's
   rank, points, trend, and the motivating gap line ("40 pts behind Summit
   Foxes" / "Leading by 40 pts"). Turns an abstract list into something personal.
   Rendered only when the participant belongs to a group on the board.
4. **The period pill ("🏆 Week 1") is a data-driven label, static for now.** It
   reads `periodLabel` from the data. No week-switching UI is built (no data for
   it yet); the field exists so the backend can drive it later.
5. **Gap-to-nav fix = normal bottom spacing, no scroll animation.** In this app
   the bottom nav is an in-flow flex sibling (content does not scroll under it),
   so the prototype's 96px bottom padding becomes a real empty gap. We use normal
   padding instead. (Product owner chose "just tighten spacing".)
6. **No SOS button on Ranks.** Already true in this codebase — `SosButton` only
   renders on Home. No change needed; noted so it is not reintroduced.

## Architecture

Mirrors the app's existing `campHome.ts` seam: **server-owned data** read through
React Query over a mock behind a TypeScript contract.

```
src/lib/
  leaderboard.ts        DATA CONTRACT + deriveLeaderboard() + useLeaderboard() hook
  mockLeaderboard.ts    the only hardcoded leaderboard content (6 seed groups)
src/components/participant/ranks/
  RanksScreen.tsx       the tab; owns data, handles loading/empty/error, composes
  PodiumHeader.tsx      green gradient header: title, period pill, top-3 podium
  YourStandingCard.tsx  the camper's own rank/points/trend/gap spotlight
  LeaderboardRow.tsx    one ranked group row
  PointsLegend.tsx      "How points are earned" card (3 category chips)
  RanksSkeleton.tsx     loading placeholder that holds the layout
```

### Data contract (`leaderboard.ts`)

The raw shape is exactly what a backend/organizer would return — no ranks, no
"you", no display math baked in.

```ts
export type LeaderboardBreakdown = {
  activities: number
  attendance: number
  challenges: number
}

export type LeaderboardGroup = {
  id: string
  name: string
  color: string            // organizer-assigned group color (runtime → inline style)
  score: number            // current total points
  previousScore: number    // score at the last snapshot — drives the trend arrow
  breakdown: LeaderboardBreakdown
}

export type Leaderboard = {
  periodLabel: string         // "Week 1" — organizer/backend owned
  groups: LeaderboardGroup[]
  currentGroupId: string | null  // the participant's group; null if unassigned
}
```

`useLeaderboard()` = `useQuery` reading `fetchLeaderboard()`, which today returns
the mock and later becomes `api.get<Leaderboard>('/camps/current/leaderboard')`.
Nothing else in the file or the components changes at that swap.

### Derivation (pure, testable) — `deriveLeaderboard()`

Takes a `Leaderboard`, returns a `LeaderboardView`. No React, no fetching, no
styling — just ranking math. This is where trend and "you" are computed.

```ts
export type Trend = { direction: 'up' | 'down' | 'same'; delta: number }

export type RankedGroup = {
  id: string
  rank: number             // 1-based, by score desc
  name: string
  color: string
  initials: string
  score: number
  isYou: boolean
  barPct: number           // score / topScore * 100, for the progress bar
  trend: Trend             // movement vs. previousScore ranking
}

export type LeaderboardView = {
  periodLabel: string
  rows: RankedGroup[]      // all groups, rank order
  you: RankedGroup | null  // the participant's group, if on the board
  nextAhead: RankedGroup | null  // group directly above "you" (for the gap line)
}

export function deriveLeaderboard(data: Leaderboard): LeaderboardView
```

- **Rank** = index after sorting by `score` desc.
- **Trend** = compare a group's current rank to its rank under `previousScore`
  ordering; `direction`/`delta` describe the movement (mirrors the prototype).
- **isYou** = `group.id === data.currentGroupId`.
- **barPct** = `round(score / maxScore * 100)`.
- **nextAhead** = the row at `you.rank - 2` (the group one place above you), or
  `null` if you are rank 1 or not on the board.

Ties: equal scores keep a stable order (sort is stable); acceptable for v1.

### Where presentation math lives (NOT in derivation)

Podium arrangement and styling stay in `PodiumHeader`: it takes `rows.slice(0, 3)`
and arranges them visually as **[2nd, 1st, 3rd]**, mapping each place to its medal
color, avatar size, and pedestal height. Keeping this in the component means the
view model stays semantic and backend-agnostic.

## UX

- **Ranks tab** renders `RanksScreen` instead of `ComingSoon`.
- **Podium header:** pine→deep gradient with the faint circle texture; "Leaderboard"
  title + period pill; the three-column podium (2nd·1st·3rd) — medal-ringed
  avatars with initials, place badge, score, stepped pedestals. Rises in on mount.
- **Your standing card:** shown when `you` exists. My rank + group name, points,
  trend chip, and the gap line: `nextAhead` present → "{delta} pts behind {name}";
  rank 1 → "Leading by {delta} pts". Pine-tinted to read as "mine".
- **Ranked list:** each `LeaderboardRow` — rank number, colored avatar with
  initials, name (+ **YOU** badge when `isYou`), a progress bar (`barPct`, group
  color), score, and trend (▲ delta green / ▼ delta warm / — muted). My row gets
  the pine-tinted highlight + pine border. Rows stagger in.
- **How points are earned:** white/surface card with three chips — ⚽ Activities,
  ✓ Attendance, 🎯 Challenges — then **normal bottom spacing** (the gap fix).
- **States:** skeleton while pending; a friendly empty state if there are no
  groups yet; a graceful error line if the fetch fails (no crash).

## Guardrails honored

- **Trilingual:** all copy via `useTranslation()`; a new `ranks` block added to
  `translations.ts` in EN / UZ / RU. The gap lines use `interpolate()` for
  `{delta}`/`{name}`. `periodLabel` is data, shown as-is. No hardcoded strings.
- **Dark mode:** semantic Tailwind tokens (`bg-canvas`, `bg-surface`, `text-content`,
  `text-muted`, `border-line`, `bg-green-tint`…), never raw hex. Group colors are
  the only inline styles, because they are runtime data.
- **Design system:** DM Sans/Mono, ~16px radii, soft shadows, pine/amber palette,
  the existing `animate-rise-in` for entrances.
- **Accessibility:** semantic markup, adequate contrast and tap targets, the
  progress bars are decorative (score is shown as text), list uses `<ol>`/`<li>`.

## Out of scope (YAGNI now, slots in behind the same contract later)

Week/period switching UI, per-category drill-down in each row (the `breakdown`
field is carried in the contract but not rendered yet), live re-ranking
animations, score count-up, individual (per-participant) leaderboards, tapping a
group to see its roster. All of these attach to the existing contract without
reshaping it.

## Testing / verification

No test runner is configured in the frontend yet, but `deriveLeaderboard()` is a
pure function and is the natural first unit test when one lands. Verification for
now is manual against the running dev server (per the "Camply phone preview"
memory): open the Ranks tab (podium + list render), confirm the **YOU** highlight
and "Your standing" gap line point at Pine Wolves, toggle dark mode (tokens hold),
switch language (all ranks copy translates), and confirm the last card sits a
normal gap above the nav. Typecheck + lint via `npm run validate` must pass.
