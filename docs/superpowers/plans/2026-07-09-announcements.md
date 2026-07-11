# Announcements (Participant) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the participant Announcements feed (`/camp/announcements` + `/camp/announcements/:id`) on a backend-ready data contract, with client-side unread tracking.

**Architecture:** A typed data contract + service (mock now, real axios commented) in `api/`, exposed via React Query hooks keyed from the registry. Read-state is client-owned (persisted Zustand). Presentational components consume the contract; two routes (list + detail) render them. Home is refactored to share the same feed query (one source of truth).

**Tech Stack:** React 19, TypeScript (strict), Vite 8, Tailwind v4 (CSS-first tokens), React Query v5, Zustand v5, React Router v7.

## Global Constraints

- **No test runner** — `frontend/CLAUDE.md`: don't add or suggest tests. Verify each task with `npm run validate` (oxlint + prettier check + `tsc -b`) and a dev-server visual check. There are no `*.test.ts` steps in this plan by design.
- **Commits require explicit user permission** (repo hard rule). Do NOT commit unprompted. Each task's final step is "stage and request a commit" — stage the files, show the message, and wait for the user's go-ahead.
- **Prettier style:** no semicolons, single quotes, trailing commas, print width 100.
- **TypeScript:** `verbatimModuleSyntax` on → use `import type { … }` for type-only imports. `noUnusedLocals`/`noUnusedParameters` on → prefix intentionally-unused params with `_`.
- **React 19 JSX runtime** — never `import React`.
- **Design tokens only, no raw hex.** Colors: `pine`, `deep`, `amber`, `amber-bright`, `amber-ink`, `sky`, and semantic `canvas`/`surface`/`surface-2`/`content`/`muted`/`line`/`soft`/`green-tint`/`amber-tint`/`danger`/`danger-tint`. Type scale: `text-meta` (11) · `text-caption` (12) · `text-body` (13) · `text-title` (15) · `text-heading` (16) · `text-subhead` (18) · `text-display` (22). Radii: `rounded-input` (16), `rounded-card` (24). Dark mode must keep working (tokens flip automatically; hardcoded hex would not).
- **i18n:** no hard-coded copy — every user-visible string comes from `useTranslation()` and ships UZ/RU/EN. The translations type forces all three; `tsc` fails if one is missing.
- **No path aliases** — relative imports only.

---

## File structure

**New files**
- `src/api/services/announcements.service.ts` — data contract types + fetchers (mock now).
- `src/api/queries/announcements.queries.ts` — `useAnnouncements`, `useAnnouncement`.
- `src/lib/mockAnnouncements.ts` — mock feed.
- `src/store/useAnnouncementReads.ts` — persisted read-state + reactive selectors.
- `src/lib/relativeTime.ts` — localized relative/absolute time + day-bucket label.
- `src/lib/initials.ts` — name → initials helper.
- `src/components/participant/announcements/AnnouncementListItem.tsx` — one feed card.
- `src/components/participant/announcements/AnnouncementsSkeleton.tsx` — loading state.
- `src/components/participant/announcements/AnnouncementsScreen.tsx` — list route.
- `src/components/participant/announcements/AnnouncementDetailScreen.tsx` — detail route.

**Modified files**
- `src/api/queryKeys.ts` — add `campKeys.announcements` + `campKeys.announcement`.
- `src/i18n/translations.ts` — add `time` + `announcements` namespaces (type + all 3 langs).
- `src/App.tsx` — real list route + `:id` detail route; drop `announcements` placeholder.
- `src/components/participant/HomeScreen.tsx` — feed-driven announcement card + unread.
- `src/components/participant/home/AnnouncementCard.tsx` — presentational, feed-based.
- `src/components/participant/home/CampCover.tsx` — bell shows unread count.
- `src/lib/campHome.ts` — remove embedded `announcement` from `CampHome`.
- `src/lib/mockCamp.ts` — remove embedded `announcement` value.

---

### Task 1: Data layer — contract, service, mock, query keys, hooks

**Files:**
- Create: `src/api/services/announcements.service.ts`
- Create: `src/lib/mockAnnouncements.ts`
- Create: `src/api/queries/announcements.queries.ts`
- Modify: `src/api/queryKeys.ts` (add two factories inside `campKeys`)

**Interfaces:**
- Produces: `Announcement`, `AnnouncementScope`, `AnnouncementAuthor` types; `announcementsService.list(campId)` / `.getById(campId, id)`; `CURRENT_CAMP_ID`; `useAnnouncements(campId?)` → `UseQueryResult<Announcement[]>`; `useAnnouncement(id, campId?)` → `UseQueryResult<Announcement>`; `campKeys.announcements(campId)`, `campKeys.announcement(campId, id)`.

- [ ] **Step 1: Create the service (contract + fetchers)**

`src/api/services/announcements.service.ts`:

```ts
import { announcementsMock } from '../../lib/mockAnnouncements'
// import { axiosInstance } from '../axiosInstance' // ← enable when the endpoint exists

/*
  The announcements SERVICE — the backend boundary for the participant feed. The
  types here are the DATA CONTRACT the organizer dashboard + backend will fill; the
  UI depends on these shapes, never on where the data comes from. No React here.

  Today the fetchers return mock data with the real axios call commented out — the
  same mock→real seam as lib/campHome.ts. Flipping to the real API touches ONLY
  these two functions.
*/

/** Where an announcement was sent: the whole camp, or one group. */
export type AnnouncementScope =
  | { kind: 'camp' }
  | { kind: 'group'; groupId: string; groupName: string }

/** The organizer who posted it (a join to the organizer record, server-side). */
export type AnnouncementAuthor = {
  id: string
  name: string
  role: 'organizer' | 'organization'
  avatarColor: string
  photo?: string | null
}

export type Announcement = {
  id: string
  campId: string
  title?: string
  body: string
  scope: AnnouncementScope
  author: AnnouncementAuthor
  pinned: boolean
  /** ISO 8601 UTC — the UI formats it per language; never store a relative string. */
  createdAt: string
  updatedAt?: string
}

/*
  No camp-switching plumbing exists yet (useCampHome() takes no id either), so a
  single current-camp id stands in. When camps become switchable this comes from
  camp context — the queries already key by campId, so nothing else changes.
*/
export const CURRENT_CAMP_ID = 'current'

/** Server returns the list pinned-first, then newest. Mirror that here. */
function sortForFeed(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export const announcementsService = {
  list: async (_campId: string): Promise<Announcement[]> => {
    // return (await axiosInstance.get<Announcement[]>(`/camps/${_campId}/announcements`)).data
    return sortForFeed(announcementsMock)
  },

  getById: async (_campId: string, id: string): Promise<Announcement> => {
    // return (await axiosInstance.get<Announcement>(`/camps/${_campId}/announcements/${id}`)).data
    const found = announcementsMock.find((a) => a.id === id)
    if (!found) throw new Error('Announcement not found')
    return found
  },
}
```

- [ ] **Step 2: Create the mock feed**

`src/lib/mockAnnouncements.ts`:

```ts
import type { Announcement } from '../api/services/announcements.service'

/*
  Mock announcement feed — stands in for the organizer's posts until the backend
  exists. The service's fetchers are the seam where this gets swapped for real API
  calls. Times are ISO UTC (the contract); the UI turns them into "20 min ago" per
  language. Ordering is enforced by the service (pinned-first), not here.
*/

// Fresh-looking timestamps: N minutes before "now", as ISO UTC.
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

export const announcementsMock: Announcement[] = [
  {
    id: 'a1',
    campId: 'current',
    body: 'Bus to Chimgan leaves at 7:00 sharp. Be at the main gate 10 minutes early.',
    scope: { kind: 'camp' },
    author: { id: 'o1', name: 'Jasur Karimov', role: 'organizer', avatarColor: '#0f6b4f' },
    pinned: true,
    createdAt: minutesAgo(20),
  },
  {
    id: 'a2',
    campId: 'current',
    title: 'Quiz results are in!',
    body: 'Great work in the quiz today, Pine Wolves! 🏆 You climbed to 2nd place — keep it up tomorrow.',
    scope: { kind: 'group', groupId: 'g1', groupName: 'Pine Wolves' },
    author: { id: 'o2', name: 'Dilnoza Aliyeva', role: 'organizer', avatarColor: '#5aa9c4' },
    pinned: false,
    createdAt: minutesAgo(140),
  },
  {
    id: 'a3',
    campId: 'current',
    body: 'Dinner moves to the Dining Hall tonight because of the weather. Same time, 19:00.',
    scope: { kind: 'camp' },
    author: { id: 'o1', name: 'Jasur Karimov', role: 'organizer', avatarColor: '#0f6b4f' },
    pinned: false,
    createdAt: minutesAgo(60 * 26),
  },
]
```

- [ ] **Step 3: Add the query keys**

In `src/api/queryKeys.ts`, add these two lines inside the `campKeys` object (after `chat`):

```ts
  /** All announcements for a camp — one invalidation refreshes the feed. */
  announcements: (campId: string) => [...campKeys.all(campId), 'announcements'] as const,
  /** A single announcement (detail screen + push deep-link). */
  announcement: (campId: string, id: string) =>
    [...campKeys.all(campId), 'announcements', id] as const,
```

- [ ] **Step 4: Create the query hooks**

`src/api/queries/announcements.queries.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { announcementsService, CURRENT_CAMP_ID } from '../services/announcements.service'
import { campKeys } from '../queryKeys'

/*
  The announcements QUERIES — the React layer over announcementsService. Components
  call these hooks only; they never touch the service or axios. Both are reads →
  both useQuery, keyed from the registry (never an inline array) so a future
  realtime "announcement:new" event can invalidate campKeys.announcements(campId)
  and every subscribed screen refetches for free.
*/

/** The whole feed for a camp (pinned-first, then newest — the server's order). */
export function useAnnouncements(campId: string = CURRENT_CAMP_ID) {
  return useQuery({
    queryKey: campKeys.announcements(campId),
    queryFn: () => announcementsService.list(campId),
  })
}

/** One announcement — powers the detail screen and push deep-links. */
export function useAnnouncement(id: string, campId: string = CURRENT_CAMP_ID) {
  return useQuery({
    queryKey: campKeys.announcement(campId, id),
    queryFn: () => announcementsService.getById(campId, id),
  })
}
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS (no errors). Then `npm run lint` → PASS.

- [ ] **Step 6: Stage and request a commit**

```bash
git add src/api/services/announcements.service.ts src/lib/mockAnnouncements.ts \
  src/api/queries/announcements.queries.ts src/api/queryKeys.ts
```
Proposed message: `feat(announcements): data contract, service, mock feed, query hooks`
Show the staged diff and wait for the user's OK before `git commit`.

---

### Task 2: Read-state store

**Files:**
- Create: `src/store/useAnnouncementReads.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `useAnnouncementReads` (Zustand store with `readIds: string[]`, `markRead(id)`), `useIsAnnouncementRead(id)` → `boolean`, `useUnreadCount(ids: string[])` → `number`.

- [ ] **Step 1: Create the store**

`src/store/useAnnouncementReads.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  Which announcements this participant has read. Read-state is CLIENT-owned (a
  per-user convenience, not organizer-visible in v1) so it lives in Zustand, not
  React Query — mixing it into the shared, cacheable announcement content would
  make every "mark read" invalidate that cache. Persisted so it survives a reload /
  PWA relaunch. Seam: if cross-device read-sync is ever wanted, this graduates to a
  server field behind the same markRead() call.
*/
type ReadsState = {
  readIds: string[]
  markRead: (id: string) => void
}

export const useAnnouncementReads = create<ReadsState>()(
  persist(
    (set) => ({
      readIds: [],
      markRead: (id) =>
        set((s) => (s.readIds.includes(id) ? s : { readIds: [...s.readIds, id] })),
    }),
    { name: 'camply-announcement-reads' },
  ),
)

/** Reactive: is THIS announcement read? Re-renders when the read-set changes. */
export function useIsAnnouncementRead(id: string): boolean {
  return useAnnouncementReads((s) => s.readIds.includes(id))
}

/** Reactive unread count for a set of announcement ids. */
export function useUnreadCount(ids: string[]): number {
  return useAnnouncementReads((s) => {
    const read = new Set(s.readIds)
    return ids.reduce((n, id) => (read.has(id) ? n : n + 1), 0)
  })
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck` → PASS. `npm run lint` → PASS.

- [ ] **Step 3: Stage and request a commit**

```bash
git add src/store/useAnnouncementReads.ts
```
Proposed message: `feat(announcements): client-owned read-state store`
Wait for the user's OK before committing.

---

### Task 3: i18n + time helpers

**Files:**
- Modify: `src/i18n/translations.ts` (add `time` + `announcements` to the type and to `uz`, `ru`, `en`)
- Create: `src/lib/relativeTime.ts`
- Create: `src/lib/initials.ts`

**Interfaces:**
- Consumes: `Lang` type from `../i18n/translations`; `interpolate` from `./interpolate`.
- Produces: `t.time.{justNow,minAgo,hoursAgo,daysAgo}`, `t.announcements.{title,empty,emptyBody,error,retry,pinned,allCamp,today,yesterday,edited,back}`; `relativeTime(iso, lang, s)`, `absoluteDateTime(iso, lang)`, `dayBucketLabel(iso, lang, labels)`, `initials(name)`.

- [ ] **Step 1: Add the two string-type blocks**

In `src/i18n/translations.ts`, near the other `type …Strings` declarations, add:

```ts
// Relative-time wording — {count} is filled per language (see lib/relativeTime).
type TimeStrings = {
  justNow: string
  minAgo: string // '{count} min ago'
  hoursAgo: string // '{count}h ago'
  daysAgo: string // '{count}d ago'
}

// Participant announcements feed + detail.
type AnnouncementsStrings = {
  title: string
  empty: string
  emptyBody: string
  error: string
  retry: string
  pinned: string
  allCamp: string
  today: string
  yesterday: string
  edited: string
  back: string
}
```

- [ ] **Step 2: Register both on the root translations type**

Find the root type that lists every namespace (the object type used by `translations: Record<Lang, …>`, containing `login`, `home`, `sos`, …). Add these two members to it:

```ts
  time: TimeStrings
  announcements: AnnouncementsStrings
```

- [ ] **Step 3: Add the `uz` strings**

Inside the `uz` translations object, add:

```ts
    time: {
      justNow: 'hozirgina',
      minAgo: '{count} daq oldin',
      hoursAgo: '{count} soat oldin',
      daysAgo: '{count} kun oldin',
    },
    announcements: {
      title: 'Eʼlonlar',
      empty: 'Hozircha eʼlonlar yoʻq',
      emptyBody: 'Tashkilotchilar eʼlon joʻnatganda, u shu yerda koʻrinadi.',
      error: 'Eʼlonlarni yuklab boʻlmadi',
      retry: 'Qayta urinish',
      pinned: 'Qadalgan',
      allCamp: 'Butun lager',
      today: 'Bugun',
      yesterday: 'Kecha',
      edited: 'tahrirlangan',
      back: 'Orqaga',
    },
```

- [ ] **Step 4: Add the `ru` strings**

Inside the `ru` translations object, add:

```ts
    time: {
      justNow: 'только что',
      minAgo: '{count} мин назад',
      hoursAgo: '{count} ч назад',
      daysAgo: '{count} дн назад',
    },
    announcements: {
      title: 'Объявления',
      empty: 'Объявлений пока нет',
      emptyBody: 'Когда организаторы опубликуют объявление, оно появится здесь.',
      error: 'Не удалось загрузить объявления',
      retry: 'Повторить',
      pinned: 'Закреплено',
      allCamp: 'Весь лагерь',
      today: 'Сегодня',
      yesterday: 'Вчера',
      edited: 'изменено',
      back: 'Назад',
    },
```

- [ ] **Step 5: Add the `en` strings**

Inside the `en` translations object, add:

```ts
    time: {
      justNow: 'just now',
      minAgo: '{count} min ago',
      hoursAgo: '{count}h ago',
      daysAgo: '{count}d ago',
    },
    announcements: {
      title: 'Announcements',
      empty: 'No announcements yet',
      emptyBody: "When organizers post an announcement, it'll show up here.",
      error: "Couldn't load announcements",
      retry: 'Try again',
      pinned: 'Pinned',
      allCamp: 'All camp',
      today: 'Today',
      yesterday: 'Yesterday',
      edited: 'edited',
      back: 'Back',
    },
```

- [ ] **Step 6: Create the time helper**

`src/lib/relativeTime.ts`:

```ts
import { interpolate } from './interpolate'
import type { Lang } from '../i18n/translations'

/*
  Turns an ISO UTC timestamp into a localized relative label ("just now",
  "20 min ago", "3h ago", "2d ago"). The contract stores absolute UTC; relative
  time is a VIEW concern, computed here per-language. The `s` strings come from the
  `time` i18n namespace so each language controls wording + token placement. Beyond
  a week we fall back to an absolute localized date.
*/
type TimeStrings = {
  justNow: string
  minAgo: string
  hoursAgo: string
  daysAgo: string
}

const LOCALE: Record<Lang, string> = { uz: 'uz', ru: 'ru', en: 'en' }

export function relativeTime(iso: string, lang: Lang, s: TimeStrings): string {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const min = Math.floor(diffSec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)

  if (min < 1) return s.justNow
  if (min < 60) return interpolate(s.minAgo, { count: min })
  if (hr < 24) return interpolate(s.hoursAgo, { count: hr })
  if (day < 7) return interpolate(s.daysAgo, { count: day })
  return new Date(iso).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' })
}

/** Absolute, localized date + time for the detail header. */
export function absoluteDateTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(LOCALE[lang], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/*
  Day-group label for the feed: "Today" / "Yesterday" / an absolute date. Compares
  calendar days in local time so 23:59 and 00:01 fall on the right side.
*/
export function dayBucketLabel(
  iso: string,
  lang: Lang,
  labels: { today: string; yesterday: string },
): string {
  const d = new Date(iso)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dayDiff = Math.round((startOf(new Date()) - startOf(d)) / 86_400_000)
  if (dayDiff <= 0) return labels.today
  if (dayDiff === 1) return labels.yesterday
  return d.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'long' })
}
```

- [ ] **Step 7: Create the initials helper**

`src/lib/initials.ts`:

```ts
/*
  Two-letter initials from a display name: "Jasur Karimov" → "JK", "Dilnoza" → "D".
  Used wherever an Avatar needs a fallback tile and the data only has a full name.
*/
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}
```

- [ ] **Step 8: Verify it compiles (this proves all 3 languages are complete)**

Run: `npm run typecheck` → PASS. If a language is missing a key, `tsc` names it — add it. Then `npm run lint` → PASS.

- [ ] **Step 9: Stage and request a commit**

```bash
git add src/i18n/translations.ts src/lib/relativeTime.ts src/lib/initials.ts
```
Proposed message: `feat(announcements): i18n strings + localized time/initials helpers`
Wait for the user's OK.

---

### Task 4: Presentational pieces — list item + skeleton

**Files:**
- Create: `src/components/participant/announcements/AnnouncementListItem.tsx`
- Create: `src/components/participant/announcements/AnnouncementsSkeleton.tsx`

**Interfaces:**
- Consumes: `Announcement` (Task 1); `relativeTime` (Task 3); `initials` (Task 3); `Avatar`, `Badge`, `Skeleton` from `../../ui`; `useTranslation`.
- Produces: `<AnnouncementListItem announcement unread onOpen />`, `<AnnouncementsSkeleton />`.

- [ ] **Step 1: Create the list item**

`src/components/participant/announcements/AnnouncementListItem.tsx`:

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { relativeTime } from '../../../lib/relativeTime'
import { initials } from '../../../lib/initials'
import { Avatar, Badge } from '../../ui'
import type { Announcement } from '../../../api/services/announcements.service'

type Props = {
  announcement: Announcement
  unread: boolean
  onOpen: () => void
}

/*
  One announcement in the feed. Pinned items get the amber "notice" treatment
  (matches the prototype); the rest are plain surface cards. An unread pine dot
  sits top-right until the participant opens it. The scope pill reads "All camp"
  (pine) or the group name (muted grey). Time is relative and localized. Purely
  presentational — the screen owns the data and the read-state.
*/
export function AnnouncementListItem({ announcement: a, unread, onOpen }: Props) {
  const { t, lang } = useTranslation()
  const isGroup = a.scope.kind === 'group'

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`relative w-full rounded-card border p-4 text-left transition active:scale-[0.99] ${
        a.pinned ? 'border-amber/25 bg-amber-tint' : 'border-line bg-surface'
      }`}
    >
      {unread && (
        <span
          className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-pine"
          aria-label="Unread"
        />
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2 pr-6">
        {a.pinned && (
          <span className="text-meta font-bold text-amber">📌 {t.announcements.pinned}</span>
        )}
        <Badge tone={isGroup ? 'muted' : 'pine'}>
          {a.scope.kind === 'group' ? a.scope.groupName : t.announcements.allCamp}
        </Badge>
        <span className="text-meta text-muted">· {relativeTime(a.createdAt, lang, t.time)}</span>
      </div>

      {a.title && <p className="mb-1 text-title font-bold text-content">{a.title}</p>}
      <p className="line-clamp-2 text-body font-medium leading-snug text-content">{a.body}</p>

      <div className="mt-3 flex items-center gap-2">
        <Avatar
          name={a.author.name}
          initials={initials(a.author.name)}
          photo={a.author.photo}
          color={a.author.avatarColor}
          size="xs"
        />
        <span className="text-caption text-muted">{a.author.name}</span>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Create the skeleton**

`src/components/participant/announcements/AnnouncementsSkeleton.tsx`:

```tsx
import { Skeleton } from '../../ui'

/*
  Loading placeholder for the announcements list — a few card skeletons so the
  layout doesn't jump when the feed arrives (ReadyProduct §9).
*/
export function AnnouncementsSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-[18px] pb-6 pt-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-card border border-line bg-surface p-4">
          <Skeleton className="mb-3 h-4 w-32" tone="soft" />
          <Skeleton className="mb-2 h-3.5 w-full" tone="soft" />
          <Skeleton className="h-3.5 w-2/3" tone="soft" />
          <Skeleton className="mt-3 h-6 w-24 rounded-full" tone="soft" />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run typecheck` → PASS. `npm run lint` → PASS.

- [ ] **Step 4: Stage and request a commit**

```bash
git add src/components/participant/announcements/AnnouncementListItem.tsx \
  src/components/participant/announcements/AnnouncementsSkeleton.tsx
```
Proposed message: `feat(announcements): list item + loading skeleton`
Wait for the user's OK.

---

### Task 5: List screen + route

**Files:**
- Create: `src/components/participant/announcements/AnnouncementsScreen.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAnnouncements` (Task 1); `useAnnouncementReads` (Task 2); `dayBucketLabel` (Task 3); `AnnouncementListItem`, `AnnouncementsSkeleton` (Task 4); `EmptyState` from `../../auth/EmptyState`; `Lang` type; `Announcement` type; `useTranslation`, `useNavigate`.
- Produces: `<AnnouncementsScreen />` mounted at `/camp/announcements`.

- [ ] **Step 1: Create the list screen**

`src/components/participant/announcements/AnnouncementsScreen.tsx`:

```tsx
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { useAnnouncements } from '../../../api/queries/announcements.queries'
import { useAnnouncementReads } from '../../../store/useAnnouncementReads'
import { dayBucketLabel } from '../../../lib/relativeTime'
import { AnnouncementListItem } from './AnnouncementListItem'
import { AnnouncementsSkeleton } from './AnnouncementsSkeleton'
import { EmptyState } from '../../auth/EmptyState'
import type { Lang } from '../../../i18n/translations'
import type { Announcement } from '../../../api/services/announcements.service'

/*
  The participant announcements feed at /camp/announcements. Owns the query and
  hands each item to the presentational AnnouncementListItem. Pinned items sit in
  their own section on top; the rest are grouped by day. Loading → skeleton,
  empty → friendly state, error → retry. Opening an item (detail route) is what
  marks it read; here we only READ the client read-set to draw unread dots.
*/
export function AnnouncementsScreen() {
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const { data, isPending, isError, refetch } = useAnnouncements()
  const readIds = useAnnouncementReads((s) => s.readIds)
  const read = new Set(readIds)

  const open = (id: string) => navigate(`/camp/announcements/${id}`)

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex flex-none items-center gap-3 px-5 pb-2 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t.announcements.back}
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
        <h1 className="font-display text-2xl font-bold tracking-tight text-content">
          {t.announcements.title}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending ? (
          <AnnouncementsSkeleton />
        ) : isError || !data ? (
          <ErrorState
            message={t.announcements.error}
            retry={t.announcements.retry}
            onRetry={() => refetch()}
          />
        ) : data.length === 0 ? (
          <EmptyFeed title={t.announcements.empty} body={t.announcements.emptyBody} />
        ) : (
          <Feed
            data={data}
            read={read}
            lang={lang}
            labels={{ today: t.announcements.today, yesterday: t.announcements.yesterday }}
            pinnedLabel={t.announcements.pinned}
            onOpen={open}
          />
        )}
      </div>
    </div>
  )
}

function Feed({
  data,
  read,
  lang,
  labels,
  pinnedLabel,
  onOpen,
}: {
  data: Announcement[]
  read: Set<string>
  lang: Lang
  labels: { today: string; yesterday: string }
  pinnedLabel: string
  onOpen: (id: string) => void
}) {
  const pinned = data.filter((a) => a.pinned)
  const rest = data.filter((a) => !a.pinned)

  // Group non-pinned items by day, preserving the newest-first order.
  const groups: { label: string; items: Announcement[] }[] = []
  for (const a of rest) {
    const label = dayBucketLabel(a.createdAt, lang, labels)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(a)
    else groups.push({ label, items: [a] })
  }

  return (
    <div className="flex flex-col gap-4 px-[18px] pb-8 pt-2">
      {pinned.length > 0 && (
        <Section label={`📌 ${pinnedLabel}`}>
          {pinned.map((a) => (
            <AnnouncementListItem
              key={a.id}
              announcement={a}
              unread={!read.has(a.id)}
              onOpen={() => onOpen(a.id)}
            />
          ))}
        </Section>
      )}
      {groups.map((g) => (
        <Section key={g.label} label={g.label}>
          {g.items.map((a) => (
            <AnnouncementListItem
              key={a.id}
              announcement={a}
              unread={!read.has(a.id)}
              onOpen={() => onOpen(a.id)}
            />
          ))}
        </Section>
      ))}
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-meta font-bold uppercase tracking-wide text-muted">{label}</h2>
      {children}
    </section>
  )
}

function EmptyFeed({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <EmptyState className="mb-5 h-40 w-40" />
      <h2 className="text-heading font-bold text-content">{title}</h2>
      <p className="mt-2 max-w-xs text-body text-muted">{body}</p>
    </div>
  )
}

function ErrorState({
  message,
  retry,
  onRetry,
}: {
  message: string
  retry: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-danger-tint text-3xl">
        ⚠️
      </div>
      <p className="text-body text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-pine px-5 py-2 text-body font-bold text-white"
      >
        {retry}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Wire the route in `App.tsx`**

In `src/App.tsx`: add the import near the other screen imports —
```tsx
import { AnnouncementsScreen } from './components/participant/announcements/AnnouncementsScreen'
```
Replace the placeholder line
```tsx
        <Route path="announcements" element={<ComingSoonRoute titleKey="announcements" />} />
```
with
```tsx
        <Route path="announcements" element={<AnnouncementsScreen />} />
```
Then remove `announcements` from the `ComingSoonRoute` `titleKey` union and its `titles` map entry, so the remaining union is `'map' | 'schedule' | 'notifications'`:
```tsx
function ComingSoonRoute({ titleKey }: { titleKey: 'map' | 'schedule' | 'notifications' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const titles = {
    map: t.nav.map,
    schedule: t.home.todaySchedule,
    notifications: t.profile.notifications,
  }
  const isTab = titleKey === 'map'
  return <ComingSoon title={titles[titleKey]} onBack={isTab ? undefined : () => navigate(-1)} />
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run typecheck` → PASS. `npm run lint` → PASS.

- [ ] **Step 4: Visual check**

Run: `npm run dev`. In the browser: complete onboarding to reach `/camp/home`, then navigate to `/camp/announcements` (tap the "All" link on the Home announcement card, or the bell). Expected: a "📌 Pinned" section with the amber bus card, then a day-grouped list (Today / Yesterday) with unread pine dots; header Back returns. Toggle dark mode and switch language (UZ/RU/EN) — copy and colors adapt, no raw-color bleed.

- [ ] **Step 5: Stage and request a commit**

```bash
git add src/components/participant/announcements/AnnouncementsScreen.tsx src/App.tsx
```
Proposed message: `feat(announcements): participant list screen + route`
Wait for the user's OK.

---

### Task 6: Detail screen + route + mark-read

**Files:**
- Create: `src/components/participant/announcements/AnnouncementDetailScreen.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAnnouncement` (Task 1); `useAnnouncementReads` (Task 2); `absoluteDateTime` (Task 3); `initials` (Task 3); `Avatar`, `Badge`, `Skeleton` from `../../ui`; `useParams`, `useNavigate`, `useTranslation`.
- Produces: `<AnnouncementDetailScreen />` mounted at `/camp/announcements/:id`.

- [ ] **Step 1: Create the detail screen**

`src/components/participant/announcements/AnnouncementDetailScreen.tsx`:

```tsx
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { useAnnouncement } from '../../../api/queries/announcements.queries'
import { useAnnouncementReads } from '../../../store/useAnnouncementReads'
import { absoluteDateTime } from '../../../lib/relativeTime'
import { initials } from '../../../lib/initials'
import { Avatar, Badge, Skeleton } from '../../ui'

/*
  A single announcement at /camp/announcements/:id — the deep-link target for
  pushes. Owns useAnnouncement(id) and marks the item read on mount (client
  read-state). Shows the full body, author, scope, exact localized time, and an
  "edited" note when updatedAt is present.
*/
export function AnnouncementDetailScreen() {
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { data: a, isPending, isError } = useAnnouncement(id)
  const markRead = useAnnouncementReads((s) => s.markRead)

  // Opening it = reading it. Runs once the item resolves.
  useEffect(() => {
    if (a) markRead(a.id)
  }, [a, markRead])

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex flex-none items-center gap-3 px-5 pb-2 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t.announcements.back}
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
        <h1 className="font-display text-xl font-bold tracking-tight text-content">
          {t.announcements.title}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-10 pt-2">
        {isPending ? (
          <div className="rounded-card border border-line bg-surface p-5">
            <Skeleton className="mb-3 h-4 w-40" tone="soft" />
            <Skeleton className="mb-2 h-4 w-full" tone="soft" />
            <Skeleton className="h-4 w-3/4" tone="soft" />
          </div>
        ) : isError || !a ? (
          <p className="mt-10 text-center text-body text-muted">{t.announcements.error}</p>
        ) : (
          <article
            className={`rounded-card border p-5 ${
              a.pinned ? 'border-amber/25 bg-amber-tint' : 'border-line bg-surface'
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {a.pinned && (
                <span className="text-meta font-bold text-amber">📌 {t.announcements.pinned}</span>
              )}
              <Badge tone={a.scope.kind === 'group' ? 'muted' : 'pine'}>
                {a.scope.kind === 'group' ? a.scope.groupName : t.announcements.allCamp}
              </Badge>
            </div>

            {a.title && <h2 className="mb-2 text-subhead font-bold text-content">{a.title}</h2>}
            <p className="whitespace-pre-line text-body leading-relaxed text-content">{a.body}</p>

            <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <Avatar
                name={a.author.name}
                initials={initials(a.author.name)}
                photo={a.author.photo}
                color={a.author.avatarColor}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-title font-bold text-content">{a.author.name}</p>
                <p className="text-caption text-muted">
                  {absoluteDateTime(a.createdAt, lang)}
                  {a.updatedAt ? ` · ${t.announcements.edited}` : ''}
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire the route in `App.tsx`**

Add the import:
```tsx
import { AnnouncementDetailScreen } from './components/participant/announcements/AnnouncementDetailScreen'
```
Add the child route directly below the list route:
```tsx
        <Route path="announcements/:id" element={<AnnouncementDetailScreen />} />
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run typecheck` → PASS. `npm run lint` → PASS.

- [ ] **Step 4: Visual check**

Run: `npm run dev`. From `/camp/announcements`, tap an unread item → detail opens at `/camp/announcements/:id` with full body + author + exact time. Press Back → its unread dot is gone (marked read). Reload the app and confirm it stays read (persisted). Hit `/camp/announcements/does-not-exist` directly → the error line shows, no crash.

- [ ] **Step 5: Stage and request a commit**

```bash
git add src/components/participant/announcements/AnnouncementDetailScreen.tsx src/App.tsx
```
Proposed message: `feat(announcements): detail screen, deep-link route, mark-read`
Wait for the user's OK.

---

### Task 7: Home integration + single-source refactor

**Files:**
- Modify: `src/components/participant/home/AnnouncementCard.tsx` (rewrite, feed-based)
- Modify: `src/components/participant/HomeScreen.tsx`
- Modify: `src/components/participant/home/CampCover.tsx`
- Modify: `src/lib/campHome.ts` (drop `announcement` from `CampHome`)
- Modify: `src/lib/mockCamp.ts` (drop the `announcement` value)

**Interfaces:**
- Consumes: `useAnnouncements` (Task 1); `useUnreadCount` (Task 2); `relativeTime` (Task 3); `Announcement` type; `Badge`.
- Produces: Home announcement card driven by the shared feed; `CampCover` bell shows the unread count.

- [ ] **Step 1: Rewrite `AnnouncementCard.tsx` to be feed-based and presentational**

Replace the whole file with:

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { relativeTime } from '../../../lib/relativeTime'
import { Badge } from '../../ui'
import type { Announcement } from '../../../api/services/announcements.service'

type Props = {
  /** Most important announcement to preview (feed is pinned-first, so [0]). */
  latest: Announcement | undefined
  /** Unread count, shown next to the header. */
  unreadCount: number
  /** Open the full announcements list. */
  onSeeAll: () => void
}

/*
  Home's announcement teaser. Shows the single most important announcement on the
  amber notice tint, plus an unread count by the header. Reads nothing itself —
  HomeScreen owns the feed query and hands the slice down, so Home and
  /camp/announcements share ONE source of truth (no drift).
*/
export function AnnouncementCard({ latest, unreadCount, onSeeAll }: Props) {
  const { t, lang } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-heading font-bold text-content">{t.home.latestAnnouncement}</h2>
          {unreadCount > 0 && (
            <Badge tone="pine" solid>
              {unreadCount}
            </Badge>
          )}
        </div>
        <button type="button" onClick={onSeeAll} className="text-body font-semibold text-pine">
          {t.home.all}
        </button>
      </div>

      {latest ? (
        <button
          type="button"
          onClick={onSeeAll}
          className="rounded-[20px] border border-amber/25 bg-amber-tint p-4 text-left"
        >
          <div className="mb-1.5 flex items-center gap-2">
            {latest.pinned && (
              <span className="text-meta font-bold text-amber">📌 {t.announcements.pinned}</span>
            )}
            <span className="text-meta text-muted">
              {relativeTime(latest.createdAt, lang, t.time)}
            </span>
          </div>
          <p className="line-clamp-2 text-body font-semibold leading-snug text-content">
            {latest.body}
          </p>
          <p className="mt-2 text-caption text-muted">— {latest.author.name}</p>
        </button>
      ) : (
        <div className="rounded-[20px] border border-line bg-surface p-4 text-caption text-muted">
          {t.announcements.empty}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Update `HomeScreen.tsx` to source the card from the feed**

Add imports near the top:
```tsx
import { useAnnouncements } from '../../api/queries/announcements.queries'
import { useUnreadCount } from '../../store/useAnnouncementReads'
```
Inside the component, after `const { data, isPending, isError } = useCampHome()`, add:
```tsx
  const { data: announcements } = useAnnouncements()
  const latest = announcements?.[0]
  const unread = useUnreadCount((announcements ?? []).map((a) => a.id))
```
Replace the announcement card line
```tsx
          <AnnouncementCard announcement={data.announcement} onSeeAll={goAnnouncements} />
```
with
```tsx
          <AnnouncementCard latest={latest} unreadCount={unread} onSeeAll={goAnnouncements} />
```
Then update the `CampCover` line to pass the count:
```tsx
        <CampCover camp={data.camp} onOpenNotifications={goAnnouncements} unreadCount={unread} />
```

- [ ] **Step 3: Update `CampCover.tsx` bell to show the unread count**

Add `unreadCount` to the `Props` type:
```tsx
type Props = {
  camp: CampHome['camp']
  onOpenNotifications: () => void
  /** Unread announcements — drives the bell badge. */
  unreadCount?: number
}
```
Update the signature to destructure it with a default:
```tsx
export function CampCover({ camp, onOpenNotifications, unreadCount = 0 }: Props) {
```
Replace the static dot
```tsx
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full border-[1.5px] border-deep bg-amber" />
```
with a conditional count badge:
```tsx
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-deep bg-amber px-1 text-[10px] font-bold leading-none text-amber-ink">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
```

- [ ] **Step 4: Remove `announcement` from the `CampHome` contract**

In `src/lib/campHome.ts`, delete this block from the `CampHome` type:
```ts
  announcement: {
    minutesAgo: number
    body: string
    author: string
  }
```
(Announcements now come exclusively from `useAnnouncements`; `campHome` no longer carries a copy.)

- [ ] **Step 5: Remove the `announcement` value from the mock**

In `src/lib/mockCamp.ts`, delete the `announcement: { … }` property from the `campHomeMock` object (the `minutesAgo`/`body`/`author` block).

- [ ] **Step 6: Verify it compiles**

Run: `npm run typecheck` → PASS. If `tsc` flags a leftover reference to `data.announcement` or the mock field, remove it. Then `npm run lint` → PASS.

- [ ] **Step 7: Visual check**

Run: `npm run dev`. On `/camp/home`: the announcement card shows the pinned bus message with the unread count badge; the header bell shows the same count. Open an announcement, go Back — the Home count drops by one (shared source of truth). Empty case: temporarily set `announcementsMock` to `[]` and confirm the card shows the "No announcements yet" placeholder and the bell badge disappears (revert after).

- [ ] **Step 8: Stage and request a commit**

```bash
git add src/components/participant/home/AnnouncementCard.tsx \
  src/components/participant/HomeScreen.tsx \
  src/components/participant/home/CampCover.tsx \
  src/lib/campHome.ts src/lib/mockCamp.ts
```
Proposed message: `refactor(home): drive announcement card + bell from the shared feed`
Wait for the user's OK.

- [ ] **Step 9: Final full validation**

Run: `npm run validate` (lint + format:check + typecheck) → PASS.
Note the Windows CRLF caveat in `frontend/CLAUDE.md`: if `format:check` warns tree-wide on line endings, format only the files you touched with `npx prettier --write --end-of-line auto <files>` — do not reformat the whole tree.

---

## Self-review notes (author)

- **Spec coverage:** contract §2 → Task 1; data-layer placement §3 → Task 1; unread tracking §4 → Tasks 2, 6, 7; components & routing §5 → Tasks 4–6; visual design §6 → Tasks 4–7; i18n §7 → Task 3; Home refactor §8 → Task 7; acceptance §10 → visual checks in Tasks 5–7. All covered.
- **Scope deviation from spec §6:** group scope pill uses the `muted` (grey) Badge tone, not `sky` — the `Badge` primitive has no sky tone and there is no sky-tint token; adding both is out of scope for this feature. All-camp = `pine`, group = `muted`. Flag if you'd rather I add a `sky` Badge variant + token instead.
- **Type consistency:** `useAnnouncements(campId?)` / `useAnnouncement(id, campId?)`, `markRead(id)`, `relativeTime(iso, lang, s)`, `dayBucketLabel(iso, lang, labels)`, `absoluteDateTime(iso, lang)`, `initials(name)`, `useUnreadCount(ids)` — names used identically across producing and consuming tasks.
- **No placeholders:** every code step shows complete, paste-ready code.
