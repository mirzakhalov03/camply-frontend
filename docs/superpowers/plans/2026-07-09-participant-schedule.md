# Participant Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give participants a full, multi-day schedule (past/today/future) reachable from the home "Today's schedule" widget's *See all*, on a data contract the backend and organizer dashboard will fill unchanged.

**Architecture:** A new `schedule` domain in `src/api/` (service + queries) mirroring the existing `announcements` pattern. Activities carry ISO timestamps; done/now/upcoming status is **derived** at render, never stored. The home widget and the full screen share one `ActivityRow` and one `useSchedule()` source — the schedule and `upNext` fields move out of `campHome` so there is a single source of truth.

**Tech Stack:** React 19, TypeScript (strict, `verbatimModuleSyntax`), React Query v5, React Router 7, Tailwind v4 (CSS-first, design tokens), Zustand (i18n language store).

## Global Constraints

- **No tests.** No test runner is configured; `frontend/CLAUDE.md` says don't add or suggest tests. Each task verifies via `npm run typecheck` + `npm run lint` + a visual check in `npm run dev`.
- **No commits without the user's explicit permission.** Each task ends at a verified checkpoint; ask before running any `git commit`.
- **Design tokens only** — no raw hex. Colors: `bg-pine`, `text-pine`, `text-content`, `text-muted`, `border-line`, `bg-surface`, `bg-green-tint`, `bg-soft`, `bg-canvas`, `text-amber`. Radii: `rounded-card` (24) / `rounded-input` (16). Type scale utilities (`text-body` 13, `text-caption` 12, `text-meta` 11, `text-title` 15, `text-heading` 16), not `text-[13px]`.
- **Dark-mode safe** — tokens flip via `.dark`; never hardcode a color that must change with theme.
- **Trilingual** — every user-facing string added to `src/i18n/translations.ts` for **all three** languages (`uz`, `ru`, `en`); TypeScript enforces shape parity. No hard-coded copy.
- **Type-only imports** use `import type { ... }` (`verbatimModuleSyntax` is on).
- **No `import React`** — `react-jsx` runtime.
- **Relative imports only** — no path aliases.
- **Prettier:** no semicolons, single quotes, trailing commas, width 100. Format only files you touch: `npx prettier --write --end-of-line auto <files>`.

---

## File Structure

**New**
- `src/lib/mockSchedule.ts` — now-anchored mock activities (the only hardcoded content; the swap seam).
- `src/api/services/schedule.service.ts` — `Activity` contract, `scheduleService.list`, and pure derivation helpers (`activityStatus`, `groupIntoDays`, `pickToday`, `pickUpNext`).
- `src/api/queries/schedule.queries.ts` — `useSchedule()` React Query hook.
- `src/components/participant/schedule/ActivityRow.tsx` — one timeline row (shared: home widget + full screen).
- `src/components/participant/schedule/DaySelector.tsx` — horizontal day-chip strip.
- `src/components/participant/schedule/ScheduleScreen.tsx` — the routed `/camp/schedule` screen.
- `src/components/participant/schedule/ScheduleSkeleton.tsx` — loading state.

**Modified**
- `src/lib/relativeTime.ts` — add exported `clockTime(iso)`.
- `src/i18n/translations.ts` — add `schedule` namespace + `time.weekdaysShort` (all 3 langs).
- `src/lib/campHome.ts` — remove `schedule` and `upNext` from `CampHome`.
- `src/lib/mockCamp.ts` — remove `schedule` and `upNext` from the mock.
- `src/components/participant/home/TodaySchedule.tsx` — re-source via `Activity[]`, render `ActivityRow`.
- `src/components/participant/home/UpNextCard.tsx` — take an `Activity`, derive time/group.
- `src/components/participant/HomeScreen.tsx` — read `useSchedule()`, feed `pickToday`/`pickUpNext`.
- `src/App.tsx` — `/camp/schedule` → `<ScheduleScreen />`; drop `'schedule'` from `ComingSoonRoute`.

Note: `src/api/queryKeys.ts` needs **no** change — `campKeys.schedule(campId)` already exists.

---

## Task 1: Schedule data domain (contract + mock + helpers + hook)

Purely additive — no existing file changes, so the app keeps compiling and running the old home. Deliverable: `useSchedule()` returns now-anchored activities, and pure helpers derive status/days.

**Files:**
- Create: `src/lib/mockSchedule.ts`
- Create: `src/api/services/schedule.service.ts`
- Create: `src/api/queries/schedule.queries.ts`
- Modify: `src/lib/relativeTime.ts` (add `clockTime`)

**Interfaces:**
- Consumes: `campKeys.schedule` from `src/api/queryKeys.ts`; `CURRENT_CAMP_ID` from `src/api/services/announcements.service.ts`.
- Produces:
  - `type ActivityScope = { kind: 'camp' } | { kind: 'group'; groupId: string; groupName: string }`
  - `type Activity = { id: string; campId: string; title: string; location: string; startsAt: string; endsAt: string; scope: ActivityScope; description?: string | null }`
  - `type ActivityStatus = 'done' | 'now' | 'upcoming'`
  - `type ScheduleDay = { key: string; date: Date; isToday: boolean; activities: Activity[] }`
  - `activityStatus(a: Activity, now?: Date): ActivityStatus`
  - `groupIntoDays(activities: Activity[], now?: Date): ScheduleDay[]`
  - `pickToday(activities: Activity[], now?: Date): Activity[]`
  - `pickUpNext(activities: Activity[], now?: Date): Activity | null`
  - `scheduleService.list(campId: string): Promise<Activity[]>`
  - `useSchedule(campId?: string)` → React Query result of `Activity[]`
  - `clockTime(iso: string): string` from `relativeTime.ts`

- [ ] **Step 1: Add `clockTime` to `src/lib/relativeTime.ts`**

Add this exported function (reuses the existing private `fmtTime`), after `absoluteDateTime`:

```ts
/** Just the 24h clock time of an ISO timestamp, e.g. "09:30". */
export function clockTime(iso: string): string {
  return fmtTime(new Date(iso))
}
```

- [ ] **Step 2: Create `src/lib/mockSchedule.ts`**

```ts
import type { Activity } from '../api/services/schedule.service'
import { CURRENT_CAMP_ID } from '../api/services/announcements.service'

/*
  Mock backing store for the schedule — the ONLY file that hardcodes example
  activities. scheduleService.list() is the seam where this is swapped for a real
  API call. Timestamps are anchored to `new Date()` at import time so the demo
  always shows a believable done / now / upcoming no matter when it runs — matching
  Camply's freshness-first philosophy.
*/

// A fixed clock time (hour:minute) on the day `dayOffset` days from today, local.
function at(dayOffset: number, hour: number, minute: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// Minutes from *right now* — used to guarantee today has a live "now" item.
function fromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

let seq = 0
const nextId = () => `act_${++seq}`

const PINE_WOLVES = { kind: 'group', groupId: 'grp_pine', groupName: 'Pine Wolves' } as const
const CAMP = { kind: 'camp' } as const

export const scheduleMock: Activity[] = [
  // Two days ago (all done)
  a(-2, [8, 0], [9, 0], 'Morning Run', 'Lakeside trail', CAMP),
  a(-2, [10, 0], [12, 0], 'Team Challenge', 'Field', CAMP),
  a(-2, [20, 0], [21, 30], 'Campfire', 'Fire Pit', CAMP),
  // Yesterday (all done)
  a(-1, [9, 30], [11, 0], 'Robotics Lab', 'Tech Tent', PINE_WOLVES),
  a(-1, [13, 0], [14, 0], 'Lunch', 'Mess Hall', CAMP),
  a(-1, [16, 0], [17, 30], 'Kayaking', 'Blue Lake', CAMP),
  // Today — anchored to the current moment so status is always live
  rel(-180, -120, 'Morning Run', 'Lakeside trail', CAMP), // done
  rel(-20, 40, 'Robotics Lab', 'Tech Tent', PINE_WOLVES), // NOW
  rel(120, 180, 'Lunch', 'Mess Hall', CAMP), // upcoming
  rel(300, 360, 'Kayaking', 'Blue Lake', CAMP), // upcoming
  // Tomorrow (all upcoming)
  a(1, [9, 0], [11, 0], 'Hiking', 'North Ridge', CAMP),
  a(1, [14, 0], [16, 0], 'Photography Workshop', 'Art Cabin', PINE_WOLVES),
  // Day after (all upcoming)
  a(2, [10, 0], [12, 0], 'Rope Course', 'Adventure Zone', CAMP),
]

// Fixed-clock activity on a given day offset.
function a(
  day: number,
  start: [number, number],
  end: [number, number],
  title: string,
  location: string,
  scope: Activity['scope'],
): Activity {
  return {
    id: nextId(),
    campId: CURRENT_CAMP_ID,
    title,
    location,
    startsAt: at(day, start[0], start[1]),
    endsAt: at(day, end[0], end[1]),
    scope,
  }
}

// Activity defined relative to *now* (minutes), for today's live trio.
function rel(
  startMin: number,
  endMin: number,
  title: string,
  location: string,
  scope: Activity['scope'],
): Activity {
  return {
    id: nextId(),
    campId: CURRENT_CAMP_ID,
    title,
    location,
    startsAt: fromNow(startMin),
    endsAt: fromNow(endMin),
    scope,
  }
}
```

- [ ] **Step 3: Create `src/api/services/schedule.service.ts`**

```ts
import { scheduleMock } from '../../lib/mockSchedule'
import { CURRENT_CAMP_ID } from './announcements.service'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

/*
  The schedule SERVICE — the backend boundary for the participant timeline. The
  types here are the DATA CONTRACT the organizer dashboard + backend will fill; the
  UI depends on these shapes, never on where data comes from. No React here.

  Today list() returns mock data with the real axios call commented out — the same
  mock→real seam as announcements.service.ts. Flipping to the real API touches ONLY
  list(). Status is DERIVED from timestamps (activityStatus), never stored, because
  done/now/upcoming is relative to the current moment.
*/

/** Who an activity is for: the whole camp, or one group. */
export type ActivityScope =
  | { kind: 'camp' }
  | { kind: 'group'; groupId: string; groupName: string }

export type Activity = {
  id: string
  campId: string
  title: string
  location: string
  /** ISO 8601 UTC — organizer-authored. The UI formats it per language. */
  startsAt: string
  endsAt: string
  scope: ActivityScope
  /** Organizer-authored detail; part of the contract, not rendered yet. */
  description?: string | null
}

export type ActivityStatus = 'done' | 'now' | 'upcoming'

/** One calendar day's worth of activities (for the day-selector strip). */
export type ScheduleDay = {
  /** Stable local-date key `YYYY-MM-DD`, used for selection + React keys. */
  key: string
  /** Local midnight of the day, for label formatting. */
  date: Date
  isToday: boolean
  activities: Activity[]
}

/** Derive status by comparing the activity window to `now`. Single source of truth. */
export function activityStatus(a: Activity, now: Date = new Date()): ActivityStatus {
  const start = new Date(a.startsAt).getTime()
  const end = new Date(a.endsAt).getTime()
  const t = now.getTime()
  if (t >= end) return 'done'
  if (t >= start) return 'now'
  return 'upcoming'
}

// Local-date key so 23:59 and 00:01 land on the correct day (not UTC).
function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Group activities by local calendar day, each day sorted by start, days ascending. */
export function groupIntoDays(activities: Activity[], now: Date = new Date()): ScheduleDay[] {
  const todayKey = dayKey(now)
  const buckets = new Map<string, Activity[]>()

  for (const act of activities) {
    const key = dayKey(new Date(act.startsAt))
    const list = buckets.get(key)
    if (list) list.push(act)
    else buckets.set(key, [act])
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => {
      const [y, m, d] = key.split('-').map(Number)
      return {
        key,
        date: new Date(y, m - 1, d),
        isToday: key === todayKey,
        activities: [...list].sort((x, y2) => x.startsAt.localeCompare(y2.startsAt)),
      }
    })
}

/** Today's activities, sorted by start — powers the home "Today's schedule" widget. */
export function pickToday(activities: Activity[], now: Date = new Date()): Activity[] {
  const todayKey = dayKey(now)
  return activities
    .filter((a) => dayKey(new Date(a.startsAt)) === todayKey)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** The next relevant activity (happening now, else soonest upcoming). Null if none. */
export function pickUpNext(activities: Activity[], now: Date = new Date()): Activity | null {
  const relevant = activities
    .filter((a) => activityStatus(a, now) !== 'done')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  return relevant[0] ?? null
}

function sortByStart(list: Activity[]): Activity[] {
  return [...list].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

export const scheduleService = {
  list: async (_campId: string = CURRENT_CAMP_ID): Promise<Activity[]> => {
    // return (await axiosInstance.get<Activity[]>(`/camps/${_campId}/schedule`)).data
    return sortByStart(scheduleMock)
  },
}
```

- [ ] **Step 4: Create `src/api/queries/schedule.queries.ts`**

```ts
import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '../services/schedule.service'
import { CURRENT_CAMP_ID } from '../services/announcements.service'
import { campKeys } from '../queryKeys'

/*
  The schedule QUERIES — the React layer over scheduleService. Components call this
  hook only; never the service or axios. Keyed from the registry (campKeys.schedule)
  so a future realtime "schedule:changed" event can invalidate it and every
  subscribed screen (home widget + full screen) refetches for free.
*/
export function useSchedule(campId: string = CURRENT_CAMP_ID) {
  return useQuery({
    queryKey: campKeys.schedule(campId),
    queryFn: () => scheduleService.list(campId),
  })
}
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck` — Expected: PASS (no errors).
Run: `npm run lint` — Expected: PASS.
There is no UI yet; this task is data-only. Confidence comes from a clean typecheck (the contract compiles and the mock satisfies `Activity`).

- [ ] **Step 6: Checkpoint** — ask the user before committing (per Global Constraints). Suggested message: `feat(schedule): add schedule data domain (contract, mock, derivation helpers, query hook)`.

---

## Task 2: Full schedule screen (`/camp/schedule`)

Additive UI. Builds the shared `ActivityRow`, the day strip, the screen, and its loading state; swaps the route from `ComingSoon` to `ScheduleScreen`. The home screen is untouched (still reads `campHome`), so the app stays green. Deliverable: navigate to `/camp/schedule` and browse days.

**Files:**
- Create: `src/components/participant/schedule/ActivityRow.tsx`
- Create: `src/components/participant/schedule/DaySelector.tsx`
- Create: `src/components/participant/schedule/ScheduleScreen.tsx`
- Create: `src/components/participant/schedule/ScheduleSkeleton.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useSchedule`, `Activity`, `ScheduleDay`, `activityStatus`, `groupIntoDays` (Task 1); `clockTime` (Task 1); `useTranslation`, `translations` shape.
- Produces:
  - `ActivityRow({ activity: Activity; last?: boolean })`
  - `DaySelector({ days: ScheduleDay[]; selectedKey: string; onSelect: (key: string) => void })`
  - `ScheduleScreen()` (default-exportless named export, like sibling screens)
  - `ScheduleSkeleton()`

- [ ] **Step 1: Add i18n keys — `time.weekdaysShort` + `schedule` namespace**

In `src/i18n/translations.ts`:

1a. Extend the `TimeStrings` type — add after `months: string[]`:

```ts
  /** 7 short weekday names, indexed by Date.getDay() (0 = Sunday … 6 = Saturday). */
  weekdaysShort: string[]
```

1b. Add a new `ScheduleStrings` type (near `AnnouncementsStrings`):

```ts
// Participant full schedule screen — day strip + timeline.
type ScheduleStrings = {
  title: string
  today: string
  empty: string // no activities the whole camp
  emptyDay: string // no activities on the selected day
  error: string
  back: string
}
```

1c. Add `schedule: ScheduleStrings` to the big `translations` record type (after `announcements`):

```ts
    announcements: AnnouncementsStrings
    schedule: ScheduleStrings
```

1d. Add the values to **each** language. In each language's `time` object add `weekdaysShort`, and add a `schedule` block:

`uz`:
```ts
    time: {
      // ...existing justNow/minAgo/hoursAgo/daysAgo/months...
      weekdaysShort: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
    },
    // ...after announcements: { ... },
    schedule: {
      title: 'Jadval',
      today: 'Bugun',
      empty: 'Hali jadval yoʻq',
      emptyDay: 'Bu kunga faoliyat yoʻq',
      error: 'Jadvalni yuklab boʻlmadi',
      back: 'Orqaga',
    },
```

`ru`:
```ts
    time: {
      // ...existing...
      weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    },
    schedule: {
      title: 'Расписание',
      today: 'Сегодня',
      empty: 'Расписания пока нет',
      emptyDay: 'В этот день активностей нет',
      error: 'Не удалось загрузить расписание',
      back: 'Назад',
    },
```

`en`:
```ts
    time: {
      // ...existing...
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    schedule: {
      title: 'Schedule',
      today: 'Today',
      empty: 'No schedule yet',
      emptyDay: 'No activities this day',
      error: "Couldn't load the schedule",
      back: 'Back',
    },
```

- [ ] **Step 2: Create `src/components/participant/schedule/ActivityRow.tsx`**

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { clockTime } from '../../../lib/relativeTime'
import { activityStatus, type Activity } from '../../../api/services/schedule.service'

type Props = {
  activity: Activity
  /** Last row in its list — drops the divider. */
  last?: boolean
}

/*
  One schedule row: time · status dot · title · location · status tag. SHARED by the
  home "Today's schedule" widget and the full schedule screen so they can never
  drift. The item happening NOW gets the pine tint, a pulsing ring, and a "Now" tag —
  the visual language the prototype uses to make "where am I supposed to be"
  answerable at a glance. Status is derived here (activityStatus), not stored.
*/
export function ActivityRow({ activity, last = false }: Props) {
  const { t } = useTranslation()
  const status = activityStatus(activity)
  const isNow = status === 'now'
  const border = last ? '' : 'border-b border-line'

  return (
    <div
      className={`flex gap-3.5 py-3.5 ${border} ${
        isNow ? '-mx-[18px] rounded-input bg-green-tint px-[18px]' : ''
      }`}
    >
      <div
        className={`w-[46px] flex-none font-mono text-body ${isNow ? 'text-pine' : 'text-muted'}`}
      >
        {clockTime(activity.startsAt)}
      </div>
      <span
        className={`mt-1.5 h-2 w-2 flex-none rounded-full ${
          isNow ? 'animate-now-ring bg-pine' : status === 'done' ? 'bg-pine/40' : 'bg-muted/40'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className={`text-body text-content ${isNow ? 'font-bold' : 'font-semibold'}`}>
          {activity.title}
        </div>
        <div className="truncate text-caption text-muted">{activity.location}</div>
      </div>
      {status === 'done' && (
        <span className="self-center text-meta font-semibold text-muted">{t.home.statusDone}</span>
      )}
      {isNow && <span className="self-center text-meta font-bold text-amber">{t.home.statusNow}</span>}
    </div>
  )
}
```

Note: `bg-pine/40` and `bg-muted/40` are token colors with an opacity modifier (Tailwind supports `/NN` alpha on any color utility) — dark-mode-safe because the base token flips. This replaces the old hardcoded `#cfd8d1` dot.

- [ ] **Step 3: Create `src/components/participant/schedule/DaySelector.tsx`**

```tsx
import { useRef, useEffect } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import type { ScheduleDay } from '../../../api/services/schedule.service'

type Props = {
  days: ScheduleDay[]
  selectedKey: string
  onSelect: (key: string) => void
}

/*
  Horizontal day-chip strip. One chip per day that has activities. Today is
  highlighted (pine) and labeled "Today"; past days are dimmed but tappable. The
  selected chip auto-scrolls into view so today is visible on open even when it sits
  mid-camp. Weekday/day labels come from the i18n `time` namespace (NOT Intl, whose
  uz data is incomplete — same reason months are owned in translations.ts).
*/
export function DaySelector({ days, selectedKey, onSelect }: Props) {
  const { t } = useTranslation()
  const stripRef = useRef<HTMLDivElement>(null)

  // Center the selected chip on mount / when selection changes.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLButtonElement>(`[data-key="${selectedKey}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [selectedKey])

  return (
    <div
      ref={stripRef}
      className="flex gap-2 overflow-x-auto px-[18px] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {days.map((day) => {
        const selected = day.key === selectedKey
        const top = day.isToday ? t.schedule.today : t.time.weekdaysShort[day.date.getDay()]
        return (
          <button
            key={day.key}
            type="button"
            data-key={day.key}
            onClick={() => onSelect(day.key)}
            aria-pressed={selected}
            className={`flex min-w-[52px] flex-none flex-col items-center rounded-input px-3 py-2 transition ${
              selected
                ? 'bg-pine text-white'
                : 'bg-surface text-muted border border-line active:scale-[0.97]'
            }`}
          >
            <span className="text-meta font-semibold uppercase tracking-wide">{top}</span>
            <span className={`text-heading font-bold ${selected ? 'text-white' : 'text-content'}`}>
              {day.date.getDate()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/participant/schedule/ScheduleSkeleton.tsx`**

```tsx
import { Skeleton } from '../../ui'

/*
  Loading state for the schedule screen — mirrors HomeSkeleton/RanksSkeleton so the
  layout doesn't jump when data arrives: a day strip of chips + a few timeline rows.
*/
export function ScheduleSkeleton() {
  return (
    <div className="h-full bg-canvas">
      <div className="flex gap-2 px-[18px] pb-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] w-[52px] rounded-input" />
        ))}
      </div>
      <div className="flex flex-col gap-4 px-[18px] pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3.5">
            <Skeleton className="h-4 w-[46px]" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

Note: confirm `Skeleton` accepts a `className` prop and is exported from `../../ui`. It is used the same way in `HomeSkeleton.tsx` / `RanksSkeleton.tsx` — match that exact usage; if their API differs, follow theirs.

- [ ] **Step 5: Create `src/components/participant/schedule/ScheduleScreen.tsx`**

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { useSchedule } from '../../../api/queries/schedule.queries'
import { groupIntoDays } from '../../../api/services/schedule.service'
import { ActivityRow } from './ActivityRow'
import { DaySelector } from './DaySelector'
import { ScheduleSkeleton } from './ScheduleSkeleton'

/*
  The full schedule — reachable from the home "Today's schedule" widget's See all,
  and a real route (/camp/schedule) so schedule push notifications can deep-link.
  Structure mirrors AnnouncementsScreen: back header + content, with loading / error /
  empty states. Days come from groupIntoDays(); the day strip selects one day's
  timeline. "Now" is computed at render (activityStatus) — good enough for a screen
  you open; a 1-minute ticker is a deliberate future refinement.
*/
export function ScheduleScreen() {
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const { data, isPending, isError } = useSchedule()

  const days = useMemo(() => groupIntoDays(data ?? []), [data])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Default to today's day (or the first day) once data arrives.
  useEffect(() => {
    if (selectedKey || days.length === 0) return
    const today = days.find((d) => d.isToday)
    setSelectedKey((today ?? days[0]).key)
  }, [days, selectedKey])

  const selectedDay = days.find((d) => d.key === selectedKey) ?? null

  // Header subtitle: the selected day's full date, e.g. "Wed, 9 Jul".
  const subtitle = selectedDay
    ? `${t.time.weekdaysShort[selectedDay.date.getDay()]}, ${selectedDay.date.getDate()} ${
        t.time.months[selectedDay.date.getMonth()]
      }`
    : ''

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex flex-none items-center gap-3 px-5 pb-2 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t.schedule.back}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-content"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-content">
            {t.schedule.title}
          </h1>
          {subtitle && <p className="text-caption text-muted" lang={lang}>{subtitle}</p>}
        </div>
      </header>

      {isPending ? (
        <ScheduleSkeleton />
      ) : isError ? (
        <div className="flex flex-1 items-center justify-center px-8 text-center text-body text-muted">
          {t.schedule.error}
        </div>
      ) : days.length === 0 ? (
        <EmptyState title={t.schedule.empty} />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-none pt-1">
            <DaySelector
              days={days}
              selectedKey={selectedKey ?? ''}
              onSelect={setSelectedKey}
            />
          </div>
          <div className="flex-1 overflow-y-auto px-[18px] pb-8 pt-3">
            {selectedDay && selectedDay.activities.length > 0 ? (
              <div className="rounded-card border border-line bg-surface px-[18px] shadow-[0_4px_16px_rgba(20,40,30,0.06)]">
                {selectedDay.activities.map((act, i) => (
                  <ActivityRow
                    key={act.id}
                    activity={act}
                    last={i === selectedDay.activities.length - 1}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={t.schedule.emptyDay} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-green-tint text-3xl">
        🗓️
      </div>
      <p className="text-body text-muted">{title}</p>
    </div>
  )
}
```

Note: the `shadow-[...]` value is copied verbatim from the existing `TodaySchedule` card so the surface treatment matches; it's an accepted arbitrary shadow already used across home cards.

- [ ] **Step 6: Wire the route in `src/App.tsx`**

Replace the schedule placeholder line:

```tsx
        <Route path="schedule" element={<ComingSoonRoute titleKey="schedule" />} />
```

with:

```tsx
        <Route path="schedule" element={<ScheduleScreen />} />
```

Add the import near the other participant imports:

```tsx
import { ScheduleScreen } from './components/participant/schedule/ScheduleScreen'
```

Then narrow `ComingSoonRoute` (schedule is no longer a placeholder). Change its type and titles:

```tsx
function ComingSoonRoute({ titleKey }: { titleKey: 'map' | 'notifications' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const titles = {
    map: t.nav.map,
    notifications: t.profile.notifications,
  }
  // Tabs (map) have the bottom nav to leave; secondary views get an explicit Back.
  const isTab = titleKey === 'map'
  return <ComingSoon title={titles[titleKey]} onBack={isTab ? undefined : () => navigate(-1)} />
}
```

(The `schedule` route no longer uses `ComingSoonRoute`; `map` and `notifications` still do.)

- [ ] **Step 7: Verify**

Run: `npm run typecheck` — Expected: PASS.
Run: `npm run lint` — Expected: PASS.
Run: `npm run dev`, open `http://localhost:5173`, log in (enter a 9-digit phone → continue → fill profile → Enter camp), then from Home tap **See all** on Today's schedule (or go to `/camp/schedule`). Expected: back header + "Schedule" title with the selected day's date; a horizontal day strip with **Today** highlighted in pine and auto-centered; today shows a done row, a **Now** row (pine tint + pulsing dot + amber "Now"), and upcoming rows; tapping a past day (dimmed chip) shows that day with all rows marked **Done**; future days show upcoming rows. Toggle dark mode (Profile → Language/settings area, or the theme toggle) and confirm colors flip. Switch language and confirm the strip labels + "Today"/"Now"/"Done" translate.

- [ ] **Step 8: Checkpoint** — ask before committing. Suggested: `feat(schedule): full schedule screen with day-selector strip`.

---

## Task 3: Migrate Home to the schedule domain (single source of truth)

Removes `schedule` and `upNext` from `campHome` and re-sources the two home widgets from `useSchedule()`. These files must change together — deleting the `CampHome` fields breaks `HomeScreen`, `TodaySchedule`, and `UpNextCard` until all are rewired — so this is one task that ends typecheck-green. Deliverable: Home's "Today's schedule" and "Up next" render from the same schedule source as the full screen, with zero drift.

**Files:**
- Modify: `src/lib/campHome.ts`
- Modify: `src/lib/mockCamp.ts`
- Modify: `src/components/participant/home/TodaySchedule.tsx`
- Modify: `src/components/participant/home/UpNextCard.tsx`
- Modify: `src/components/participant/HomeScreen.tsx`

**Interfaces:**
- Consumes: `useSchedule`, `pickToday`, `pickUpNext`, `Activity`, `ActivityScope` (Task 1); `ActivityRow` (Task 2); `clockTime` (Task 1).
- Produces: `TodaySchedule({ activities: Activity[]; onSeeAll: () => void })`; `UpNextCard({ activity: Activity; onOpen: () => void })`.

- [ ] **Step 1: Trim the `CampHome` contract in `src/lib/campHome.ts`**

Remove the `ScheduleStatus` type, the `ScheduleItem` type, the `upNext` field, and the `schedule` field. The schedule now lives in its own domain (`api/services/schedule.service.ts`); keeping copies here would be a second source of truth. The `CampHome` type becomes:

```ts
export type GroupMember = {
  initials: string
  /** Avatar background — runtime data, so consumers apply it as an inline style. */
  color: string
}

export type CampHome = {
  camp: {
    name: string
    location: string
    dateRange: string
    dayCurrent: number
    dayTotal: number
    coverImage: string
  }
  group: {
    name: string
    memberCount: number
    members: GroupMember[]
  }
  /** Unread group-chat messages — drives the Chat tab badge. */
  unreadChat: number
}
```

Delete the now-orphaned `ScheduleStatus` / `ScheduleItem` exports entirely. Leave `fetchCampHome` / `useCampHome` as-is.

- [ ] **Step 2: Trim the mock in `src/lib/mockCamp.ts`**

Delete the `upNext: { ... }` block and the `schedule: [ ... ]` array from `campHomeMock`. The object keeps `camp`, `group`, `unreadChat`. (Leave the SOS section below it untouched.) Resulting `campHomeMock`:

```ts
export const campHomeMock: CampHome = {
  camp: {
    name: 'Yoshlar Summer Camp 2026',
    location: 'Chimgan Mountains',
    dateRange: 'Jul 6 – Jul 19',
    dayCurrent: 6,
    dayTotal: 14,
    coverImage: '/camp-cover.jpg',
  },
  group: {
    name: 'Pine Wolves',
    memberCount: 8,
    members: [
      { initials: 'AR', color: '#5aa9c4' },
      { initials: 'BT', color: '#2f8f6b' },
      { initials: 'DK', color: '#e0982a' },
    ],
  },
  unreadChat: 3,
}
```

- [ ] **Step 3: Refactor `src/components/participant/home/TodaySchedule.tsx`**

Replace the whole file — it now takes today's `Activity[]` and renders the shared `ActivityRow` (deleting its private `ScheduleRow`):

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import type { Activity } from '../../../api/services/schedule.service'
import { ActivityRow } from '../schedule/ActivityRow'

type Props = {
  /** Today's activities, already sorted (from pickToday). */
  activities: Activity[]
  /** Open the full schedule. */
  onSeeAll: () => void
}

/*
  Compact "today" timeline on Home. Renders the SAME ActivityRow as the full
  schedule screen, so the two can never drift. Data comes from the schedule domain
  (useSchedule → pickToday) via HomeScreen — not from campHome anymore.
*/
export function TodaySchedule({ activities, onSeeAll }: Props) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-heading font-bold text-content">{t.home.todaySchedule}</h2>
        <button type="button" onClick={onSeeAll} className="text-body font-semibold text-pine">
          {t.home.seeAll}
        </button>
      </div>

      <div className="rounded-[20px] border border-line bg-surface px-[18px] shadow-[0_4px_16px_rgba(20,40,30,0.06)]">
        {activities.length > 0 ? (
          activities.map((act, i) => (
            <ActivityRow key={act.id} activity={act} last={i === activities.length - 1} />
          ))
        ) : (
          <p className="py-5 text-center text-caption text-muted">{t.schedule.emptyDay}</p>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Refactor `src/components/participant/home/UpNextCard.tsx`**

It now takes an `Activity` and derives the time (via `clockTime`) and the "with {group}" line (only when the activity is group-scoped):

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { clockTime, type TimeStrings } from '../../../lib/relativeTime'
import type { Activity } from '../../../api/services/schedule.service'

type Props = {
  /** The next relevant activity (from pickUpNext). */
  activity: Activity
  /** Jump to the full schedule. */
  onOpen: () => void
}

/*
  "Up next" — the single most useful thing on Home: what's happening now/next and
  where. Derived from the schedule domain (pickUpNext), so it can't drift from the
  timeline. Tapping anywhere opens the schedule. The time is split (09 / :30) to echo
  the prototype's chunky time chip.
*/
export function UpNextCard({ activity, onOpen }: Props) {
  const { t } = useTranslation()
  const [hour, minute] = clockTime(activity.startsAt).split(':')
  const groupName = activity.scope.kind === 'group' ? activity.scope.groupName : null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3.5 rounded-[20px] border border-line bg-surface p-4 text-left shadow-[0_4px_16px_rgba(20,40,30,0.06)] transition active:scale-[0.99]"
    >
      <div className="flex h-[52px] w-[52px] flex-none flex-col items-center justify-center rounded-[15px] bg-green-tint">
        <span className="text-title font-bold leading-none text-pine">{hour}</span>
        <span className="text-meta font-semibold text-pine/70">:{minute}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-meta font-semibold uppercase tracking-wide text-muted">
          {t.home.upNext}
        </div>
        <div className="mt-0.5 text-heading font-bold text-content">{activity.title}</div>
        <div className="mt-0.5 truncate text-caption text-muted">
          {groupName
            ? `${activity.location} · ${interpolate(t.home.upNextWith, { group: groupName })}`
            : activity.location}
        </div>
      </div>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-soft">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-pine"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  )
}
```

Two token fixes made while here: the old hardcoded `stroke="#0f6b4f"` becomes `stroke="currentColor"` + `className="text-pine"` (dark-mode-safe), and the old `text-[#3f8a6e]` minute becomes `text-pine/70`. Remove the unused `TimeStrings` import if the linter flags it — it is only imported if referenced; in this file it is **not** referenced, so do **not** add it. (Import only `clockTime`.)

Correction to the import line above — use exactly:

```tsx
import { clockTime } from '../../../lib/relativeTime'
```

- [ ] **Step 5: Re-source the widgets in `src/components/participant/HomeScreen.tsx`**

Add the schedule hook + selectors, and feed the widgets. Full updated file:

```tsx
import { useCampHome } from '../../lib/campHome'
import { useAnnouncements } from '../../api/queries/announcements.queries'
import { useSchedule } from '../../api/queries/schedule.queries'
import { pickToday, pickUpNext } from '../../api/services/schedule.service'
import { useUnreadCount } from '../../store/useAnnouncementReads'
import { CampCover } from './home/CampCover'
import { UpNextCard } from './home/UpNextCard'
import { TodaySchedule } from './home/TodaySchedule'
import { AnnouncementCard } from './home/AnnouncementCard'
import { MyGroupCard } from './home/MyGroupCard'
import { HomeSkeleton } from './HomeSkeleton'
import { useCamp } from './campContext'

/*
  Participant Home. It OWNS the data and hands slices to each card as props — the
  cards are presentational. Camp/group come from useCampHome; the timeline comes from
  the schedule domain (useSchedule), and Home derives today's list + up-next from it
  (pickToday / pickUpNext) — one source of truth shared with the full schedule
  screen. While loading, a skeleton keeps the layout from jumping; on error we
  degrade gracefully. Navigation comes from the shell context (routes), not props.
*/
export function HomeScreen() {
  const { goSchedule, goAnnouncements, goChat } = useCamp()
  const { data, isPending, isError } = useCampHome()
  const { data: schedule } = useSchedule()
  const { data: announcements } = useAnnouncements()
  const latest = announcements?.[0]
  const unread = useUnreadCount((announcements ?? []).map((a) => a.id))

  if (isPending || isError || !data) {
    return <HomeSkeleton />
  }

  const todayActivities = pickToday(schedule ?? [])
  const upNext = pickUpNext(schedule ?? [])

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <CampCover camp={data.camp} onOpenNotifications={goAnnouncements} unreadCount={unread} />

      <div className="flex flex-col gap-3.5 px-[18px] pb-6 pt-4">
        {upNext && (
          <div className="animate-rise-in" style={{ animationDelay: '40ms' }}>
            <UpNextCard activity={upNext} onOpen={goSchedule} />
          </div>
        )}
        <div className="animate-rise-in" style={{ animationDelay: '110ms' }}>
          <TodaySchedule activities={todayActivities} onSeeAll={goSchedule} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '180ms' }}>
          <AnnouncementCard latest={latest} unreadCount={unread} onSeeAll={goAnnouncements} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '250ms' }}>
          <MyGroupCard group={data.group} onOpen={goChat} />
        </div>
      </div>
    </div>
  )
}
```

Note: `UpNextCard` renders only when `pickUpNext` is non-null (e.g. once the whole camp is over, it hides rather than showing a stale field). This avoids adding an "all done" empty-copy string.

- [ ] **Step 6: Verify**

Run: `npm run typecheck` — Expected: PASS (the deleted `CampHome.schedule`/`upNext` now have no dangling references).
Run: `npm run lint` — Expected: PASS (no unused imports; watch `TimeStrings` was NOT added to UpNextCard).
Run: `npm run dev`, open Home. Expected: "Up next" shows the current/next activity (time chip, title, location, and "with Pine Wolves" only for group activities); "Today's schedule" lists today's rows using the same row style as the full screen, with the live **Now** row tinted; **See all** opens the full schedule. Confirm Home and the full screen agree on which item is "now". Toggle dark mode + switch language and confirm both widgets translate/flip.

- [ ] **Step 7: Checkpoint** — ask before committing. Suggested: `refactor(home): source Today's schedule + Up next from the schedule domain`.

---

## Self-Review

**Spec coverage:**
- Day-selector strip → Task 2 `DaySelector`. ✓
- Inline rows, not tappable → `ActivityRow` renders no `onClick`. ✓
- Minimal display / robust model → `Activity` carries `startsAt/endsAt/scope/description`; UI shows time/title/location/status only. ✓
- Status derived, never stored → `activityStatus`, Task 1. ✓
- Self-contained days (no camp-date coupling) → `groupIntoDays` builds from activity dates. ✓
- One source of truth (schedule + upNext leave campHome) → Task 3. ✓
- Now-anchored mock → `mockSchedule.ts` `rel()` helper. ✓
- Shared `ActivityRow` → created Task 2, consumed by home widget Task 3. ✓
- Route swap at existing `/camp/schedule` → Task 2 Step 6. ✓
- Loading skeleton + empty + error states → `ScheduleSkeleton`, `EmptyState`, error branch. ✓
- Trilingual, tokens, dark mode, responsive → Global Constraints + per-step notes. ✓
- Out of scope (detail sheet, category icons, live ticker, empty-day chips) → none built. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**Type consistency:** `Activity`, `ActivityScope`, `ActivityStatus`, `ScheduleDay`, `activityStatus`, `groupIntoDays`, `pickToday`, `pickUpNext`, `scheduleService.list`, `useSchedule`, `clockTime` — names identical across Tasks 1–3. `TodaySchedule` prop renamed `schedule`→`activities` and `UpNextCard` prop `upNext`→`activity`, with all call sites updated in Task 3 Step 5. ✓
