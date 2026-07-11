# Organization Surface → Working Prototype — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `/admin/*` organization skeleton into a working prototype — a real Dashboard, a Camps list, grown navigation — all verified end-to-end against the real backend.

**Architecture:** Add two routed screens (Dashboard, Camps) to the existing `AdminShell`. The Dashboard reuses the already-wired `useOrganizers()` query (real `GET /organizers`) for live stats; Camps gets a new mock-seam data layer (`adminCamps.service.ts` returns mock, real `/camps` call commented) mirroring the existing organizers pattern. The organizer-add feature already works — verify and surface it from the Dashboard.

**Tech Stack:** React 19 (react-jsx, no `import React`), TypeScript strict, Vite, Tailwind v4 (CSS-first tokens), React Query, React Router, i18n via `useTranslation()`.

**Companion spec:** `docs/superpowers/specs/2026-07-12-organization-surface-prototype-design.md` — read it for context, the backend constraint, and decision rationale.

## Global Constraints

- **No test runner exists — do NOT add one** (project rule). The per-task gate is `npm run typecheck` (pass) + manual verification by driving the app. `npm run validate` (lint + format:check + typecheck) is the final gate.
- **No git commit/push without explicit user permission** (project hard rule). Where a step says "commit," stage the files and prepare the message, but only run `git commit` once the user approves.
- **Trilingual, no hard-coded copy** — every user-facing string ships UZ/RU/EN via `t.admin.*`. The three language blocks live at ~line 502 (UZ), ~920 (RU), ~1323 (EN) of `src/i18n/translations.ts`; the `AdminStrings` type at ~line 443 enforces coverage.
- **Design-system tokens only** — no raw hex. Colors: `bg-pine`, `to-deep`, `bg-surface`, `bg-surface-2`, `text-content`, `text-muted`, `border-line`, `bg-soft`, `bg-green-tint`. Type: `text-meta/caption/body/title/heading/subhead/display`. Radii: `rounded-input`, `rounded-card`. Keep dark mode working (never hardcode a color).
- **Use `ui/` primitives** — `Button` (variant `primary`/`accent`/`ghost`, `size`, `fullWidth`, `href`, `onClick`, `disabled`), `Badge` (tone `pine`/`amber`/`danger`/`muted`), `Skeleton` (`className`, `tone`), `Sheet`. Import from the barrel: `import { Button, Badge, Skeleton } from '../../ui'`. Don't hand-roll them.
- **Imports are relative** (no path aliases). Use `import type { ... }` for type-only imports (`verbatimModuleSyntax` is on). No semicolons, single quotes, trailing commas, width 100 (Prettier).
- **Format only files you touch:** `npx prettier --write --end-of-line auto <files>` (repo has a CRLF caveat — never run format across the tree).
- **Server data through React Query only** — never mirror it into Zustand. Never inline a `['...']` query key; pull from a factory in `queryKeys.ts`.

---

## File Structure

**New files:**
- `src/lib/mockAdminCamps.ts` — mock camp data (org-wide, attributed to organizers).
- `src/api/services/adminCamps.service.ts` — `AdminCamp` type + `list()` boundary (mock now, real commented).
- `src/api/queries/adminCamps.queries.ts` — `useAdminCamps()` React Query hook.
- `src/components/organization/camps/AdminCampCard.tsx` — one camp card (read-only).
- `src/components/organization/camps/AdminCampsScreen.tsx` — the Camps list screen.
- `src/components/organization/dashboard/DashboardScreen.tsx` — the Dashboard landing.

**Modified files:**
- `src/i18n/translations.ts` — extend `AdminStrings`; add `dashboard`/`camps`/`nav` keys in UZ/RU/EN.
- `src/api/queryKeys.ts` — add `adminCampKeys`.
- `src/components/organization/AdminNav.tsx` — two nav items + icons.
- `src/App.tsx` — index redirect → dashboard; add dashboard + camps routes.

---

## Task 1: i18n — extend AdminStrings (UZ/RU/EN)

Foundation: every screen below reads `t.admin.dashboard.*` and `t.admin.camps.*`. TypeScript won't compile a screen that references a missing key, and `AdminStrings` forces all three languages, so do this first.

**Files:**
- Modify: `src/i18n/translations.ts` (type ~443; UZ block ~502; RU block ~920; EN block ~1323)

**Interfaces:**
- Produces: `t.admin.nav.dashboard`, `t.admin.nav.camps`, and the `t.admin.dashboard.*` / `t.admin.camps.*` trees consumed by Tasks 3–4.

- [ ] **Step 1: Extend the `AdminStrings` type.** In the `nav` object (currently `{ organizers: string; logout: string }`) add `dashboard` and `camps`. After the `create: { ... }` block (before the closing `}` of `AdminStrings` at ~line 476) add the `dashboard` and `camps` shapes:

```ts
  nav: { dashboard: string; camps: string; organizers: string; logout: string }
```

```ts
  dashboard: {
    title: string
    subtitle: string
    stats: { organizers: string; active: string; deactivated: string; camps: string }
    quickActions: { addOrganizer: string; viewCamps: string }
    recentOrganizers: string
    loadError: string
  }
  camps: {
    title: string
    subtitle: string // '{count} camps'
    by: string // 'by {name}'
    statusActive: string
    statusUpcoming: string
    statusDraft: string
    statusArchived: string
    empty: string
    emptyHint: string
    loadError: string
    participants: string // '{count} participants'
  }
```

- [ ] **Step 2: Fill the UZ block** (the `admin:` object at ~line 502). Change `nav` and append `dashboard` + `camps` after the `create` object:

```ts
      nav: {
        dashboard: 'Boshqaruv',
        camps: 'Oromgohlar',
        organizers: 'Tashkilotchilar',
        logout: 'Chiqish',
      },
```

```ts
      dashboard: {
        title: 'Boshqaruv paneli',
        subtitle: 'Tashkilot umumiy koʻrinishi',
        stats: {
          organizers: 'Tashkilotchilar',
          active: 'Faol',
          deactivated: 'Faolsiz',
          camps: 'Oromgohlar',
        },
        quickActions: {
          addOrganizer: 'Tashkilotchi qoʻshish',
          viewCamps: 'Oromgohlarni koʻrish',
        },
        recentOrganizers: 'Soʻnggi tashkilotchilar',
        loadError: 'Maʼlumotlarni yuklab boʻlmadi',
      },
      camps: {
        title: 'Oromgohlar',
        subtitle: '{count} ta oromgoh',
        by: '{name} tomonidan',
        statusActive: 'Faol',
        statusUpcoming: 'Tez orada',
        statusDraft: 'Qoralama',
        statusArchived: 'Arxivlangan',
        empty: 'Hozircha oromgohlar yoʻq',
        emptyHint: 'Tashkilotchilar oromgoh yaratganda, ular shu yerda koʻrinadi.',
        loadError: 'Oromgohlarni yuklab boʻlmadi',
        participants: '{count} ishtirokchi',
      },
```

- [ ] **Step 3: Fill the RU block** (~line 920). Same shape:

```ts
      nav: {
        dashboard: 'Панель',
        camps: 'Лагеря',
        organizers: 'Организаторы',
        logout: 'Выход',
      },
```

```ts
      dashboard: {
        title: 'Панель управления',
        subtitle: 'Обзор организации',
        stats: {
          organizers: 'Организаторы',
          active: 'Активные',
          deactivated: 'Неактивные',
          camps: 'Лагеря',
        },
        quickActions: {
          addOrganizer: 'Добавить организатора',
          viewCamps: 'Посмотреть лагеря',
        },
        recentOrganizers: 'Недавние организаторы',
        loadError: 'Не удалось загрузить данные',
      },
      camps: {
        title: 'Лагеря',
        subtitle: '{count} лагерей',
        by: 'Организатор: {name}',
        statusActive: 'Активный',
        statusUpcoming: 'Скоро',
        statusDraft: 'Черновик',
        statusArchived: 'Архив',
        empty: 'Пока нет лагерей',
        emptyHint: 'Когда организаторы создадут лагеря, они появятся здесь.',
        loadError: 'Не удалось загрузить лагеря',
        participants: '{count} участников',
      },
```

- [ ] **Step 4: Fill the EN block** (~line 1323). Same shape:

```ts
      nav: {
        dashboard: 'Dashboard',
        camps: 'Camps',
        organizers: 'Organizers',
        logout: 'Log out',
      },
```

```ts
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Organization overview',
        stats: {
          organizers: 'Organizers',
          active: 'Active',
          deactivated: 'Deactivated',
          camps: 'Camps',
        },
        quickActions: {
          addOrganizer: 'Add organizer',
          viewCamps: 'View camps',
        },
        recentOrganizers: 'Recent organizers',
        loadError: "Couldn't load data",
      },
      camps: {
        title: 'Camps',
        subtitle: '{count} camps',
        by: 'by {name}',
        statusActive: 'Active',
        statusUpcoming: 'Upcoming',
        statusDraft: 'Draft',
        statusArchived: 'Archived',
        empty: 'No camps yet',
        emptyHint: "When organizers create camps, they'll appear here.",
        loadError: "Couldn't load camps",
        participants: '{count} participants',
      },
```

> Note: the existing `nav.logout` values were `'Chiqish'` / `'Выход'` / `'Log out'` — keep whatever is already there; only add `dashboard` and `camps`.

- [ ] **Step 5: Typecheck.** Run: `npm run typecheck` — Expected: PASS (no missing-key errors across the three blocks). If it fails with "property is missing in type," a language block is missing a key you added to the type — add it.

- [ ] **Step 6: Commit** (with permission).

```bash
npx prettier --write --end-of-line auto src/i18n/translations.ts
git add src/i18n/translations.ts
git commit -m "i18n(admin): add dashboard + camps strings (UZ/RU/EN)"
```

---

## Task 2: Camps data layer (mock-seam)

Build the read-side data boundary before the screen that consumes it. Mirrors the organizers pattern (`adminOrganizerKeys` → service → query), kept separate from the organizer's own `organizerKeys`/`campsService`.

**Files:**
- Modify: `src/api/queryKeys.ts` (add `adminCampKeys`)
- Create: `src/lib/mockAdminCamps.ts`
- Create: `src/api/services/adminCamps.service.ts`
- Create: `src/api/queries/adminCamps.queries.ts`

**Interfaces:**
- Produces: `type AdminCamp`, `type AdminCampStatus`, `adminCampsService.list(): Promise<AdminCamp[]>`, `useAdminCamps()` → React Query result of `AdminCamp[]`. Consumed by Tasks 3–4.

- [ ] **Step 1: Add the key factory.** In `src/api/queryKeys.ts`, after the `adminOrganizerKeys` block, add:

```ts
/*
  The org admin's CAMPS list — every camp across every organizer (a different
  projection than organizerKeys, which is one organizer's own camps). Mock-backed
  today via adminCamps.service.ts; the key is ready for the real /camps endpoint.
*/
export const adminCampKeys = {
  all: ['adminCamps'] as const,
  list: () => [...adminCampKeys.all, 'list'] as const,
}
```

- [ ] **Step 2: Create the mock data** `src/lib/mockAdminCamps.ts`:

```ts
import type { AdminCamp } from '../api/services/adminCamps.service'

/*
  Mock camps for the ORGANIZATION admin view — camps span multiple organizers, so
  each carries an organizerName (the org-view attribution the organizer's own list
  doesn't need). Covers each status so the Camps screen renders all states. Replaced
  by the real GET /camps response when the backend gains a camps domain.
*/
export const adminCampsMock: AdminCamp[] = [
  {
    id: 'camp-1',
    name: 'Summer Leadership Camp',
    organizerName: 'Aziz Karimov',
    location: 'Chimgan',
    dateRange: 'Jul 6 – Jul 19',
    status: 'active',
    participantCount: 128,
  },
  {
    id: 'camp-2',
    name: 'Code & Create Bootcamp',
    organizerName: 'Dilnoza Yusupova',
    location: 'Tashkent',
    dateRange: 'Aug 1 – Aug 14',
    status: 'upcoming',
    participantCount: 64,
  },
  {
    id: 'camp-3',
    name: 'Autumn Debate Intensive',
    organizerName: 'Aziz Karimov',
    location: 'Samarkand',
    dateRange: 'Sep 10 – Sep 20',
    status: 'draft',
    participantCount: 0,
  },
]
```

- [ ] **Step 3: Create the service** `src/api/services/adminCamps.service.ts`:

```ts
import { adminCampsMock } from '../../lib/mockAdminCamps'
// import { axiosInstance } from '../axiosInstance' // ← enable when GET /camps exists

/*
  The admin CAMPS service — the backend boundary for the organization's org-wide
  camps list. The types here are the DATA CONTRACT the backend will fill; the UI
  depends on these shapes, never on where the data comes from.

  BACKEND STATUS: there is no /camps endpoint yet (no Camp model server-side). Today
  list() returns mock data with the real axios call commented out — the same
  mock→real seam as camps.service.ts / announcements.service.ts. When the endpoint
  lands, this ONE function body changes; the UI does not.
*/

/** Camp lifecycle (Context.md §6). `archived` is a past camp kept for history. */
export type AdminCampStatus = 'active' | 'upcoming' | 'draft' | 'archived'

/** One camp as the ORGANIZATION admin lists it (across all organizers). */
export type AdminCamp = {
  id: string
  name: string
  /** The organizer who created/runs it — the org-view attribution. */
  organizerName: string
  location: string
  /** Human date range, already formatted server-side, e.g. "Jul 6 – Jul 19". */
  dateRange: string
  status: AdminCampStatus
  participantCount: number
}

export const adminCampsService = {
  /** Every camp across every organizer, newest/active first (server-ordered later). */
  list: async (): Promise<AdminCamp[]> => {
    // return (await axiosInstance.get<{ camps: AdminCamp[] }>('/camps')).data.camps
    return adminCampsMock
  },
}
```

- [ ] **Step 4: Create the query hook** `src/api/queries/adminCamps.queries.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { adminCampsService } from '../services/adminCamps.service'
import { adminCampKeys } from '../queryKeys'

/*
  The admin CAMPS query — the React layer over adminCampsService. Components call
  this hook only. Keyed from the registry so a future realtime/invalidation nudge
  refreshes every subscriber for free.
*/
export function useAdminCamps() {
  return useQuery({
    queryKey: adminCampKeys.list(),
    queryFn: adminCampsService.list,
  })
}
```

- [ ] **Step 5: Typecheck.** Run: `npm run typecheck` — Expected: PASS.

- [ ] **Step 6: Commit** (with permission).

```bash
npx prettier --write --end-of-line auto src/api/queryKeys.ts src/lib/mockAdminCamps.ts src/api/services/adminCamps.service.ts src/api/queries/adminCamps.queries.ts
git add src/api/queryKeys.ts src/lib/mockAdminCamps.ts src/api/services/adminCamps.service.ts src/api/queries/adminCamps.queries.ts
git commit -m "feat(admin): add camps mock-seam data layer"
```

---

## Task 3: Camps screen + route + nav item

Render the Camps list, wire its route, and add its nav item. After this task, `/admin/camps` is reachable and shows the mock list in all states.

**Files:**
- Create: `src/components/organization/camps/AdminCampCard.tsx`
- Create: `src/components/organization/camps/AdminCampsScreen.tsx`
- Modify: `src/components/organization/AdminNav.tsx` (add Camps item + icon)
- Modify: `src/App.tsx` (add `/admin/camps` route)

**Interfaces:**
- Consumes: `useAdminCamps()`, `type AdminCamp`, `type AdminCampStatus` (Task 2); `t.admin.camps.*` (Task 1); `Badge` from `ui`.
- Produces: `AdminCampsScreen` (default-less named export) mounted at `/admin/camps`.

- [ ] **Step 1: Create the card** `src/components/organization/camps/AdminCampCard.tsx`:

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { Badge } from '../../ui'
import type { AdminCamp, AdminCampStatus } from '../../../api/services/adminCamps.service'

/*
  One camp as the organization admin sees it — READ-ONLY (the org rarely creates or
  manages camps; that's the organizer's job). Name, organizer attribution, location,
  dates, a status Badge, and the participant count.
*/

const STATUS_TONE: Record<AdminCampStatus, 'pine' | 'amber' | 'muted'> = {
  active: 'pine',
  upcoming: 'amber',
  draft: 'muted',
  archived: 'muted',
}

export function AdminCampCard({ camp }: { camp: AdminCamp }) {
  const { t } = useTranslation()

  const statusLabel = {
    active: t.admin.camps.statusActive,
    upcoming: t.admin.camps.statusUpcoming,
    draft: t.admin.camps.statusDraft,
    archived: t.admin.camps.statusArchived,
  }[camp.status]

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-title font-bold text-content">{camp.name}</div>
          <div className="mt-0.5 text-caption text-muted">
            {interpolate(t.admin.camps.by, { name: camp.organizerName })}
          </div>
        </div>
        <Badge tone={STATUS_TONE[camp.status]}>{statusLabel}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-3 text-caption text-muted">
        <span>{camp.location}</span>
        <span aria-hidden>·</span>
        <span className="font-mono">{camp.dateRange}</span>
        <span aria-hidden>·</span>
        <span>{interpolate(t.admin.camps.participants, { count: camp.participantCount })}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the screen** `src/components/organization/camps/AdminCampsScreen.tsx`:

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { Skeleton } from '../../ui'
import { useAdminCamps } from '../../../api/queries/adminCamps.queries'
import { AdminCampCard } from './AdminCampCard'

/*
  The camps list at /admin/camps — every camp across every organizer (org-wide read
  view). Same gradient-header + state pattern as OrganizersScreen. Read-only: no
  "create camp" button (the org rarely creates camps and there's no backend to do so
  — a dead button would violate the "hidden button ≠ permission" guardrail).
*/
export function AdminCampsScreen() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useAdminCamps()

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <h1 className="text-subhead font-bold text-white">{t.admin.camps.title}</h1>
        {data ? (
          <p className="text-caption text-white/80">
            {interpolate(t.admin.camps.subtitle, { count: data.length })}
          </p>
        ) : null}
      </div>

      <div className="px-5 pt-4 md:px-8">
        {isPending ? (
          <Skeleton className="h-40" tone="surface" />
        ) : isError || !data ? (
          <p className="py-8 text-center text-body text-muted">{t.admin.camps.loadError}</p>
        ) : data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-title font-bold text-content">{t.admin.camps.empty}</p>
            <p className="mt-1 text-caption text-muted">{t.admin.camps.emptyHint}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.map((camp) => (
              <AdminCampCard key={camp.id} camp={camp} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add the Camps nav item.** In `src/components/organization/AdminNav.tsx`, update `useNavItems()` to include Camps (Dashboard is added in Task 4), and add a `CampsIcon`:

```tsx
function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  return [
    { to: '/admin/camps', label: t.admin.nav.camps, icon: <CampsIcon /> },
    { to: '/admin/organizers', label: t.admin.nav.organizers, icon: <OrganizersIcon /> },
  ]
}
```

Add near the other icons (matching the `strokeWidth="2.1"` stroke style — a tent glyph):

```tsx
function CampsIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={icon}
    >
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 4v16" />
    </svg>
  )
}
```

- [ ] **Step 4: Add the route.** In `src/App.tsx`, add the import and the route inside the `/admin` element block (next to `organizers`):

```tsx
import { AdminCampsScreen } from './components/organization/camps/AdminCampsScreen'
```

```tsx
            <Route path="camps" element={<AdminCampsScreen />} />
```

- [ ] **Step 5: Typecheck.** Run: `npm run typecheck` — Expected: PASS.

- [ ] **Step 6: Manual verify.** Start the app (backend seeded + running per Task 5 setup, or just the frontend for this screen since it's mock): `npm run dev`. Log in at `/admin/login` (`admin` / `1234`), click the **Camps** nav item. Expected: three camp cards render with correct status badges (Active=pine, Upcoming=amber, Draft=muted), organizer attribution, location/date/participants line. Resize to mobile width → cards go 1-column and the bottom nav shows Camps; desktop → 2-column with the sidebar. Confirm dark mode (toggle) keeps colors correct.

- [ ] **Step 7: Commit** (with permission).

```bash
npx prettier --write --end-of-line auto src/components/organization/camps/AdminCampCard.tsx src/components/organization/camps/AdminCampsScreen.tsx src/components/organization/AdminNav.tsx src/App.tsx
git add src/components/organization/camps/ src/components/organization/AdminNav.tsx src/App.tsx
git commit -m "feat(admin): camps list screen, route, and nav item"
```

---

## Task 4: Dashboard screen + route + nav item + index redirect

The org's real landing screen: live stats from `useOrganizers()`, a camps count from `useAdminCamps()`, quick actions (Add organizer reuses `NewOrganizerSheet`; View camps links), and recent organizers. After this task, logging in lands on `/admin/dashboard`.

**Files:**
- Create: `src/components/organization/dashboard/DashboardScreen.tsx`
- Modify: `src/components/organization/AdminNav.tsx` (prepend Dashboard item + icon)
- Modify: `src/App.tsx` (index redirect → dashboard; add `/admin/dashboard` route)

**Interfaces:**
- Consumes: `useOrganizers()` (`src/api/queries/organizers.queries.ts`, returns `Organizer[]` with `.active`), `useAdminCamps()` (Task 2), `NewOrganizerSheet` + `OrganizerRow` (`src/components/organization/organizers/`), `Button`/`Skeleton` from `ui`, `t.admin.dashboard.*` (Task 1).
- Produces: `DashboardScreen` mounted at `/admin/dashboard`; the `/admin` index now redirects here.

**Decision (resolves spec §8):** `NewOrganizerSheet` is self-contained (owns its own form state and the create mutation). The Dashboard renders its **own** instance with a local `open` state — no lifting, no logic duplication. Only one screen is mounted at a time (routed), so two instances never conflict.

- [ ] **Step 1: Create the Dashboard** `src/components/organization/dashboard/DashboardScreen.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { Button, Skeleton } from '../../ui'
import { useOrganizers } from '../../../api/queries/organizers.queries'
import { useAdminCamps } from '../../../api/queries/adminCamps.queries'
import { OrganizerRow } from '../organizers/OrganizerRow'
import { NewOrganizerSheet } from '../organizers/NewOrganizerSheet'

/*
  The organization's landing screen at /admin/dashboard. Live stats derived from the
  real GET /organizers list (shared via React Query with the Organizers screen — no
  extra fetch) plus a camps count from the mock-seam camps query. Quick actions reuse
  the existing NewOrganizerSheet; recent organizers reuse OrganizerRow. Invents no
  data and adds no new endpoint.
*/
export function DashboardScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  const organizers = useOrganizers()
  const camps = useAdminCamps()

  const list = organizers.data ?? []
  const activeCount = list.filter((o) => o.active).length
  const stats = [
    { label: t.admin.dashboard.stats.organizers, value: list.length },
    { label: t.admin.dashboard.stats.active, value: activeCount },
    { label: t.admin.dashboard.stats.deactivated, value: list.length - activeCount },
    { label: t.admin.dashboard.stats.camps, value: camps.data?.length ?? 0 },
  ]

  const recent = list.slice(0, 4)

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <h1 className="text-subhead font-bold text-white">{t.admin.dashboard.title}</h1>
        <p className="text-caption text-white/80">{t.admin.dashboard.subtitle}</p>
      </div>

      <div className="flex flex-col gap-6 px-5 pt-5 md:px-8">
        {/* Stat tiles */}
        {organizers.isPending ? (
          <Skeleton className="h-24" tone="surface" />
        ) : organizers.isError ? (
          <p className="py-6 text-center text-body text-muted">{t.admin.dashboard.loadError}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-card border border-line bg-surface px-4 py-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]"
              >
                <div className="text-display font-bold text-content">{s.value}</div>
                <div className="mt-0.5 text-caption text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => setSheetOpen(true)}>
            {t.admin.dashboard.quickActions.addOrganizer}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/camps')}>
            {t.admin.dashboard.quickActions.viewCamps}
          </Button>
        </div>

        {/* Recent organizers */}
        {recent.length > 0 ? (
          <div>
            <h2 className="mb-2 text-title font-bold text-content">
              {t.admin.dashboard.recentOrganizers}
            </h2>
            <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
              {recent.map((o, i) => (
                <OrganizerRow key={o.id} organizer={o} last={i === recent.length - 1} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <NewOrganizerSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
```

- [ ] **Step 2: Prepend the Dashboard nav item.** In `src/components/organization/AdminNav.tsx`, update `useNavItems()` so Dashboard is first:

```tsx
function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  return [
    { to: '/admin/dashboard', label: t.admin.nav.dashboard, icon: <DashboardIcon /> },
    { to: '/admin/camps', label: t.admin.nav.camps, icon: <CampsIcon /> },
    { to: '/admin/organizers', label: t.admin.nav.organizers, icon: <OrganizersIcon /> },
  ]
}
```

Add the icon (grid/home glyph, same stroke style):

```tsx
function DashboardIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={icon}
    >
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}
```

- [ ] **Step 3: Wire the route + index redirect.** In `src/App.tsx`, add the import, add the dashboard route, and change the index redirect target from `organizers` to `dashboard`:

```tsx
import { DashboardScreen } from './components/organization/dashboard/DashboardScreen'
```

The `/admin` element block should read:

```tsx
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="camps" element={<AdminCampsScreen />} />
            <Route path="organizers" element={<OrganizersScreen />} />
          </Route>
```

- [ ] **Step 4: Typecheck.** Run: `npm run typecheck` — Expected: PASS.

- [ ] **Step 5: Manual verify.** With backend running + seeded (Task 5 setup), `npm run dev`, log in. Expected: you land on `/admin/dashboard`; stat tiles show real organizer counts (0/0/0 on a fresh DB) and the camps count (3, from mock). Click **Add organizer** → the sheet opens; create one → counts increment and it appears under Recent organizers. Click **View camps** → routes to `/admin/camps`. Check mobile (2-col tiles, bottom nav 3 items) and desktop (4-col tiles, sidebar 3 items) and dark mode.

- [ ] **Step 6: Commit** (with permission).

```bash
npx prettier --write --end-of-line auto src/components/organization/dashboard/DashboardScreen.tsx src/components/organization/AdminNav.tsx src/App.tsx
git add src/components/organization/dashboard/ src/components/organization/AdminNav.tsx src/App.tsx
git commit -m "feat(admin): dashboard screen, route, nav item, index redirect"
```

---

## Task 5: End-to-end verification & polish (the "working prototype" bar)

No new files — this is the acceptance gate. Drive the whole surface against the real backend and confirm the organizer flow is genuinely wired, not just typed.

**Files:** none (verification + any small fixes surfaced).

- [ ] **Step 1: Start the backend.** Ensure MongoDB is running and `camply-backend/.env` has a valid `MONGO_URI`. Then:

```bash
cd ../camply-backend
npm run seed:org   # provisions org  admin / 1234  (dev defaults)
npm run dev        # :4000
```

Expected: seed prints the created org; server logs "listening on :4000". (If `seed:org` reports the org already exists, that's fine — reuse `admin` / `1234`.)

- [ ] **Step 2: Start the frontend.**

```bash
cd ../camply-frontend
npm run dev        # :5173, proxies /api → :4000
```

- [ ] **Step 3: Drive the real flow in the browser.** Confirm each, in order:
  1. `/admin/login` → log in `admin` / `1234` → lands on `/admin/dashboard`.
  2. Dashboard stat tiles load from the **real** `GET /organizers` (Network tab shows the request; counts reflect the DB).
  3. **Add organizer** from the Dashboard quick action → fill name/surname/phone/password → submit → counts increment, it shows under Recent organizers (real `POST /organizers`).
  4. Try adding the **same phone** again → inline "already registered" error (real 409), sheet stays open.
  5. Go to **Organizers** → the new organizer is listed → **Deactivate** (confirm dialog) → badge flips to Deactivated (real `PATCH`), **Reactivate** → flips back.
  6. Go to **Camps** → mock list renders with statuses/attribution; empty + loading states behave (throttle network to see loading).
  7. **Reload** the page → still logged in (real cookie session revalidated); **Log out** → returns to `/admin/login`, and reload does not sign back in.

- [ ] **Step 4: Fix anything the flow surfaces**, then re-run the affected step. (Common: a proxy/env mismatch, or a missing translation key — the compiler catches the latter earlier.)

- [ ] **Step 5: Final gate.** Run: `npm run validate` — Expected: lint + format:check + typecheck all PASS. (If `format:check` warns tree-wide, that's the known CRLF caveat — confirm the files *you* touched are clean via `npx prettier --check --end-of-line auto <your files>`.)

- [ ] **Step 6: Update the frontend CLAUDE.md** — the org surface section (`### Navigation`) currently says the admin surface's "child `organizers` is the create/list/deactivate dashboard." Update it to note the surface now has **Dashboard, Camps (mock-seam), and Organizers**, index → dashboard, and that Camps awaits a backend `/camps` endpoint. This keeps the doc matching the code (a stated rule in that file).

- [ ] **Step 7: Commit** (with permission).

```bash
git add camply-frontend/CLAUDE.md
git commit -m "docs(admin): note dashboard + camps in org surface guide"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- §4.1 Navigation & routing → Tasks 3–4 (nav items, routes, index redirect). ✅
- §4.2 Dashboard → Task 4. ✅
- §4.3 Camps + data layer → Tasks 2–3. ✅
- §4.4 Organizers verify/polish → Task 5. ✅
- §4.5 i18n → Task 1. ✅
- §5 Files touched → all mapped across tasks. ✅
- §6 Verification → Task 5. ✅
- §8 open item (NewOrganizerSheet sharing) → resolved in Task 4 decision note. ✅

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every command has expected output. ✅

**Type consistency:** `AdminCamp`/`AdminCampStatus` defined in Task 2 §Step 3 and consumed with matching names in Tasks 3–4. `adminCampsService.list` / `useAdminCamps` names match across tasks. `STATUS_TONE` covers all four `AdminCampStatus` members. `t.admin.dashboard.*` / `t.admin.camps.*` keys used in Tasks 3–4 all defined in Task 1. `Organizer.active` used in the Dashboard matches the service type. ✅
