# Participant Schedule — Design Spec

**Date:** 2026-07-09
**Surface:** Participant
**Status:** Approved, pending implementation plan

## Goal

Give participants a real schedule they can browse across days — past, today, and
future — not just today's compact widget. The home screen keeps a compact
"Today's schedule" preview; its **See all** opens a full schedule screen with a
day-selector strip.

Because this feature will later be filled by the **backend** and authored in the
**organizer dashboard**, the data contract is designed up front so those three
surfaces agree with no reshaping.

## Product decisions (locked)

- **Day navigation:** horizontal **day-selector strip**. One day's timeline in
  focus at a time. Today highlighted, past days dimmed but tappable.
- **Activity interaction:** **inline rows only**, not tappable. No detail
  sheet/screen in this iteration.
- **Display richness:** **minimal on screen** (time · title · location · status),
  **robust underneath** (full timestamped, scoped model — see contract).

## Architecture

### 1. New `schedule` domain (mirrors the `announcements` pattern)

Real server interaction lives in `src/api/`, per `frontend/CLAUDE.md`. New feature
= service + queries + registry key, **not** the legacy `lib/<domain>.ts` shape.

**`api/services/schedule.service.ts`** — the backend boundary + data contract. No
React. Today returns mock; the real `axios` call sits commented out (same
mock→real seam as `announcements.service.ts`).

```ts
export type ActivityScope =
  | { kind: 'camp' }
  | { kind: 'group'; groupId: string; groupName: string }

export type Activity = {
  id: string
  campId: string
  title: string
  location: string
  startsAt: string  // ISO 8601 UTC — organizer-authored
  endsAt: string    // ISO 8601 UTC
  scope: ActivityScope
  description?: string | null  // organizer-authored; part of contract, not rendered yet
}

export const scheduleService = {
  list: async (campId: string): Promise<Activity[]> => {
    // return (await axiosInstance.get<Activity[]>(`/camps/${campId}/schedule`)).data
    return sortByStart(scheduleMock)
  },
}
```

`scope` is retained despite minimal display: `CONTEXT.md` §1 defines schedules as
"camp-wide **and per-group** timelines," so per-group targeting is a real product
requirement the backend will send. `description` is optional and unrendered — zero
cost, and the organizer will author it.

### 2. Status is DERIVED, never stored

`status: 'done' | 'now' | 'upcoming'` cannot be persisted — it is relative to the
current moment and goes stale as the clock moves. One pure exported function is the
single source of truth, used by **both** the home widget and the full screen:

```ts
export type ActivityStatus = 'done' | 'now' | 'upcoming'

export function activityStatus(a: Activity, now = new Date()): ActivityStatus {
  const start = new Date(a.startsAt).getTime()
  const end = new Date(a.endsAt).getTime()
  const t = now.getTime()
  if (t >= end) return 'done'
  if (t >= start) return 'now'
  return 'upcoming'
}
```

"Now" is computed **on render** (when the screen opens). A 1-minute ticker is an
explicit future polish, out of scope here.

### 3. Days — self-contained, no coupling to camp dates

A pure selector groups activities by **calendar date** and sorts. The day strip
shows one chip per date that has activities, labeled by localized weekday + date,
today marked. No dependency on camp start/end — the schedule domain stands alone.

```ts
export type ScheduleDay = { date: string; isToday: boolean; activities: Activity[] }
export function groupIntoDays(activities: Activity[], now = new Date()): ScheduleDay[]
```

Selectors for the home widget derive from the same list:

```ts
export function pickToday(activities: Activity[], now = new Date()): Activity[]
export function pickUpNext(activities: Activity[], now = new Date()): Activity | null
export function pickTodayWindow(activities: Activity[], now = new Date(), size = 4): Activity[]
```

### 3a. Home "Today's schedule" window (client display rule)

The home widget shows a **sliding window of `HOME_WINDOW_SIZE` (4)** of today's
activities — *including passed ones* — not the whole day. This is a **client
presentation rule, not part of the backend/organizer contract**: the API serves the
full day and the organizer authors the full day; only the compact home widget windows
it. The full schedule screen still renders every activity.

Behavior of `pickTodayWindow`:

- Shows a batch of 4 that **advances one batch at a time** — the visible set stays
  put until its **last** item is done, then jumps to the next batch.
- For the final partial batch it **backfills** from earlier finished activities so a
  full 4 always shows when the day has ≥4. Days with <4 show them all.
- Examples (size 4): 6 today → `[0,1,2,3]` then `[2,3,4,5]`; 7 → `[0,1,2,3]` then
  `[3,4,5,6]`; 3 → `[0,1,2]`.
- Implemented via the first-unfinished index → batch start, clamped to `n - size`.
  Pure function; works identically on real API data.

### 4. Queries

**`api/queries/schedule.queries.ts`** — the React layer. Components call this hook
only.

```ts
export function useSchedule(campId: string = CURRENT_CAMP_ID) {
  return useQuery({
    queryKey: campKeys.schedule(campId),   // already exists in queryKeys.ts
    queryFn: () => scheduleService.list(campId),
  })
}
```

A future realtime `schedule:changed` event invalidates `campKeys.schedule(campId)`
and every subscribed screen refetches for free.

### 5. One source of truth (small, justified refactor of `campHome`)

Keeping `schedule` inside `campHome` **and** adding a schedule domain = two sources
of truth, which `frontend/CLAUDE.md` forbids. Therefore:

- Remove the `schedule` array from the `CampHome` type and `campHomeMock`.
- Home **"Today's schedule"** widget renders `pickToday(useSchedule())`.
- **`upNext`** becomes **derived** via `pickUpNext(useSchedule())` instead of a
  standalone hardcoded `CampHome.upNext` field — removes drift permanently. The
  `upNext` field is removed from the `CampHome` contract and `UpNextCard` is
  re-sourced.

### 6. Mock data anchored to *now*

`lib/mockSchedule.ts` generates ISO timestamps **relative to `new Date()`** at
runtime — a few past days, today (with one live "now"), and future days — so the
demo always shows a believable done/now/upcoming regardless of when it runs.
Matches Camply's "freshness" philosophy. This is the only file that hardcodes
example content; `scheduleService.list()` is the swap seam.

## UI components — `src/components/participant/schedule/`

- **`ActivityRow.tsx`** — one row: time · status dot · title · location · status
  tag ("Now" amber / "Done" muted). **Shared** by the home widget and the full
  screen so they can never drift. The visual language matches the current
  `TodaySchedule` row (pine tint + pulsing ring for "now").
- **`DaySelector.tsx`** — horizontal scrollable chip strip. Today selected by
  default, past chips dimmed, all tappable. Selected-day state is local to
  `ScheduleScreen`.
- **`ScheduleScreen.tsx`** — routed screen: back header + camp date-range subtitle,
  `DaySelector`, the selected day's timeline (list of `ActivityRow`), plus loading
  skeleton and empty state. Replaces the `ComingSoon` stub at the **existing**
  `/camp/schedule` route in `App.tsx`.
- **`ScheduleSkeleton.tsx`** — loading state, matching the `HomeSkeleton` /
  `RanksSkeleton` convention.

**Refactor:** `home/TodaySchedule.tsx` re-implemented on top of `ActivityRow` and
sourced from `useSchedule()` (today slice) instead of a `schedule` prop.

## Cross-cutting requirements

- **Design system:** tokens only (`bg-pine`, `text-content`, `rounded-card`,
  `bg-green-tint`, `text-amber`…), no raw hex. Dark-mode-safe. Existing `ui/`
  primitives (`Skeleton`, `Button` for back if needed).
- **i18n:** every new string added to `i18n/translations.ts` in **EN / UZ / RU**
  (schedule title, "See all", "Now"/"Done", empty state, "Today", relative day
  labels). No hard-coded copy. Date/weekday formatting via `Intl` with the active
  locale.
- **Responsive:** mobile-first inside the existing `max-w-2xl` participant shell;
  day strip scrolls horizontally on narrow screens.

## Route

`/camp/schedule` — already a real route (currently `ComingSoonRoute`). Swap the
element to `<ScheduleScreen />`. Deep-linkable for future schedule push
notifications.

## Out of scope (explicit)

- Activity detail sheet/screen (rows are not tappable).
- Category/type icons + colors on activities.
- Live 1-minute "now" ticker.
- Empty-day chips (days with zero activities are omitted from the strip).
- Organizer authoring UI and the real backend endpoint (the contract is designed
  to receive them).

## Files touched

**New**
- `api/services/schedule.service.ts`
- `api/queries/schedule.queries.ts`
- `lib/mockSchedule.ts`
- `components/participant/schedule/ActivityRow.tsx`
- `components/participant/schedule/DaySelector.tsx`
- `components/participant/schedule/ScheduleScreen.tsx`
- `components/participant/schedule/ScheduleSkeleton.tsx`

**Modified**
- `lib/campHome.ts` — remove `schedule` + `upNext` from `CampHome`
- `lib/mockCamp.ts` — remove `schedule` + `upNext` from mock
- `components/participant/home/TodaySchedule.tsx` — re-source via `useSchedule`, use `ActivityRow`
- `components/participant/home/UpNextCard.tsx` — re-source via `pickUpNext(useSchedule())`
- `components/participant/HomeScreen.tsx` — wire widgets to `useSchedule`
- `App.tsx` — `/camp/schedule` → `<ScheduleScreen />`
- `i18n/translations.ts` — new EN/UZ/RU keys
- `api/queryKeys.ts` — (no change; `campKeys.schedule` already present)
