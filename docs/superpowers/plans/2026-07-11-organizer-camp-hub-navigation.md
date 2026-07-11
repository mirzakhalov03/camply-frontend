# Organizer Camp Hub — Navigation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the organizer camp-detail tab strip with a hub-and-spoke model — a camp "home" hub of live feature cards, each feature opening as its own full-screen window.

**Architecture:** One source-of-truth list (`campFeatures`) drives both the hub's card grid and the router's nested routes, so navigation and UI can't drift. `CampDetailShell` becomes a pure data boundary; `CampHub` renders header + grid; `FeatureShell` wraps each feature full-screen with a back arrow to the hub. URLs are unchanged, so push/deep-links keep working.

**Tech Stack:** React 19, React Router v7, Tailwind v4 (CSS-first, token-based), TanStack Query, TypeScript. Vite dev server on :5173.

## Global Constraints

- **No test runner** — project rule: don't add or suggest tests. Verify with `npm run typecheck` and manual browser checks. `npm run validate` (lint + format:check + typecheck) is the pre-commit gate and must pass.
- **Trilingual, no hard-coded copy** — every user string ships EN/UZ/RU in `src/i18n/translations.ts`, typed. Read via `useTranslation()` → `t`; use `interpolate(template, vars)` for `{token}` placeholders.
- **Tokens only, no raw hex** — brand/semantic color tokens, `rounded-input`(16)/`rounded-card`(24), the named type scale (`text-body` etc.). Dark mode is class-based and must stay correct in both themes.
- **`import type { ... }`** for type-only imports (`verbatimModuleSyntax` is on). No `import React`. No path aliases — relative imports. Prettier: no semicolons, single quotes, width 100.
- **Commits require the user's explicit go-ahead** (project rule: never commit without permission). The commit step is written into each task, but pause and ask before running it.
- **URLs must not change** — `/org/camps/:campId/<feature>` stays identical (deep-link/push contract).

---

### Task 1: i18n — add hub card-stat strings

**Files:**
- Modify: `src/i18n/translations.ts` (the `org.detail` section, all three languages)

**Interfaces:**
- Produces: new keys under `t.org.detail` — `hubParticipantsStat` (`"{count} total"`), `hubGroupsStat` (`"{count} groups"`), `hubScheduleStat` (`"Day {current}/{total}"`), `hubScheduleStatEmpty` (`"Timeline"`), `hubAnnouncementsStat` (`"Broadcasts"`), `hubStatEmpty` (`"—"`). Existing `tabMap`/`tabParticipants`/… stay (reused as card labels + window titles). Existing `t.org.camps.liveMapMeta` (`"{onsite} on-site · {alerts} alerts"`) and `leaderboardMeta` (`"{group} lead"`) are reused for the Map/Leaderboard card stats.

- [ ] **Step 1: Add the keys to all three languages**

In `src/i18n/translations.ts`, inside each language's `org.detail` object (uz, ru, en), add (translate the values appropriately per language — English shown):

```ts
// English (en.org.detail) — mirror with UZ/RU translations in their objects
hubParticipantsStat: '{count} total',
hubGroupsStat: '{count} groups',
hubScheduleStat: 'Day {current}/{total}',
hubScheduleStatEmpty: 'Timeline',
hubAnnouncementsStat: 'Broadcasts',
hubStatEmpty: '—',
```

UZ suggestions: `'{count} ta'`, `'{count} guruh'`, `'{current}/{total}-kun'`, `'Jadval'`, `'Eʼlonlar'`, `'—'`.
RU suggestions: `'{count} всего'`, `'{count} групп'`, `'День {current}/{total}'`, `'Расписание'`, `'Объявления'`, `'—'`.

- [ ] **Step 2: Typecheck (the translations type forces all languages to cover every key)**

Run: `npm run typecheck`
Expected: PASS. If it fails with a missing-key error, a language is missing one of the new keys — add it.

- [ ] **Step 3: Commit** (ask permission first)

```bash
git add src/i18n/translations.ts
git commit -m "i18n(org): add camp hub card-stat strings"
```

---

### Task 2: `campFeatures.tsx` — the single source of truth

**Files:**
- Create: `src/components/organizer/detail/campFeatures.tsx`

**Interfaces:**
- Consumes: `OrganizerCamp`, `OrganizerSummary` from `../../../api/services/camps.service`; `interpolate` from `../../../lib/interpolate`; `useTranslation` return type for `t`.
- Produces:
  - `type T = ReturnType<typeof useTranslation>['t']`
  - `type FeatureStat = { text: string; alert?: boolean }`
  - `type FeatureStatContext = { t: T; camp: OrganizerCamp; summary?: OrganizerSummary; alertCount: number; leaderName: string | null }`
  - `type FeatureTint = 'green' | 'amber'`
  - `type CampFeature = { key: string; to: string; icon: ReactNode; tint: FeatureTint; label: (t: T) => string; stat: (ctx: FeatureStatContext) => FeatureStat }`
  - `const CAMP_FEATURES: CampFeature[]` — six entries: map, leaderboard, participants, groups, schedule, announcements (tints alternate green/amber).

- [ ] **Step 1: Create the registry file**

```tsx
import type { ReactNode } from 'react'
import type { OrganizerCamp, OrganizerSummary } from '../../../api/services/camps.service'
import type { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'

type T = ReturnType<typeof useTranslation>['t']

export type FeatureStat = { text: string; alert?: boolean }

export type FeatureStatContext = {
  t: T
  camp: OrganizerCamp
  summary?: OrganizerSummary
  alertCount: number
  leaderName: string | null
}

export type FeatureTint = 'green' | 'amber'

export type CampFeature = {
  key: string
  /** Route segment — MUST match the URL under /org/camps/:campId (deep-link contract). */
  to: string
  icon: ReactNode
  /** Icon-tile tint on the hub card (keeps the grid two-tone, matching the mock). */
  tint: FeatureTint
  /** Card label + full-screen window title. */
  label: (t: T) => string
  /** Pure selector over already-fetched data → the card's live micro-stat. */
  stat: (ctx: FeatureStatContext) => FeatureStat
}

// Icons are small inline SVGs (stroke-current) matching OrganizerNav's style.
const svg = 'stroke-current flex-none'

export const CAMP_FEATURES: CampFeature[] = [
  {
    key: 'map',
    to: 'map',
    tint: 'green',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={svg}>
        <path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" />
        <circle cx="12" cy="11" r="2.3" />
      </svg>
    ),
    label: (t) => t.org.detail.tabMap,
    stat: ({ t, summary, alertCount }) => ({
      text: interpolate(t.org.camps.liveMapMeta, { onsite: summary?.onSite ?? 0, alerts: alertCount }),
      alert: alertCount > 0,
    }),
  },
  {
    key: 'leaderboard',
    to: 'leaderboard',
    tint: 'amber',
    icon: <span className="text-[18px] leading-none">🏆</span>,
    label: (t) => t.org.detail.tabLeaderboard,
    stat: ({ t, leaderName }) => ({
      text: leaderName ? interpolate(t.org.camps.leaderboardMeta, { group: leaderName }) : t.org.detail.hubStatEmpty,
    }),
  },
  {
    key: 'participants',
    to: 'participants',
    tint: 'green',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={svg}>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 20a5.5 5.5 0 0 0-2.3-4.5" />
      </svg>
    ),
    label: (t) => t.org.detail.tabParticipants,
    stat: ({ t, camp }) => ({ text: interpolate(t.org.detail.hubParticipantsStat, { count: camp.participantCount }) }),
  },
  {
    key: 'groups',
    to: 'groups',
    tint: 'amber',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.1" className={svg}>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
    label: (t) => t.org.detail.tabGroups,
    stat: ({ t, camp }) => ({ text: interpolate(t.org.detail.hubGroupsStat, { count: camp.groupCount }) }),
  },
  {
    key: 'schedule',
    to: 'schedule',
    tint: 'green',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={svg}>
        <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
        <path d="M3.5 9h17M8 3v3M16 3v3" />
      </svg>
    ),
    label: (t) => t.org.detail.tabSchedule,
    stat: ({ t, camp }) => ({
      text: camp.dayTotal > 0
        ? interpolate(t.org.detail.hubScheduleStat, { current: camp.dayCurrent, total: camp.dayTotal })
        : t.org.detail.hubScheduleStatEmpty,
    }),
  },
  {
    key: 'announcements',
    to: 'announcements',
    tint: 'amber',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={svg}>
        <path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM17 8a4 4 0 0 1 0 8" />
      </svg>
    ),
    label: (t) => t.org.detail.tabAnnouncements,
    stat: ({ t }) => ({ text: t.org.detail.hubAnnouncementsStat }),
  },
]
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS. Common failure: a referenced i18n key doesn't exist — confirm Task 1 landed and key names match exactly.

- [ ] **Step 3: Commit** (ask permission first)

```bash
git add src/components/organizer/detail/campFeatures.tsx
git commit -m "feat(org): add campFeatures registry (hub/route source of truth)"
```

---

### Task 3: `FeatureCard.tsx` — one hub tile

**Files:**
- Create: `src/components/organizer/detail/FeatureCard.tsx`

**Interfaces:**
- Consumes: `Link` from `react-router-dom`; `FeatureStat`, `FeatureTint` from `./campFeatures`.
- Produces: `FeatureCard` component — props `{ to: string; icon: ReactNode; label: string; stat: FeatureStat; tint: FeatureTint }`.

- [ ] **Step 1: Create the card (the big dashboard-card style — QuickLinks promoted)**

Generous `rounded-card`, a colored icon tile driven by `tint`, bold title, muted
stat line, and a status dot top-right (danger when `stat.alert`). This is the
Image #4 look — the same visual as `organizer/camps/QuickLinks`, made reusable.

```tsx
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { FeatureStat, FeatureTint } from './campFeatures'

// Icon-tile tints — existing brand tokens (see index.css @theme / QuickLinks usage).
// Confirm `text-amber-ink` is the right amber-on-tint text token; fall back to
// `text-heading`-neighboring amber token if not.
const TINT: Record<FeatureTint, string> = {
  green: 'bg-green-tint text-pine',
  amber: 'bg-amber-tint text-amber-ink',
}

/*
  One camp-hub card: colored icon tile, feature label, live micro-stat, and a
  status dot (danger when an alert is active). A Link (not a button) so it's real
  navigation into the feature window — deep-linkable and right-clickable. Visual
  matches organizer/camps/QuickLinks, laid out big and 2-up on the hub.
*/
export function FeatureCard({
  to,
  icon,
  label,
  stat,
  tint,
}: {
  to: string
  icon: ReactNode
  label: string
  stat: FeatureStat
  tint: FeatureTint
}) {
  return (
    <Link
      to={to}
      className="rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)] transition active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-input ${TINT[tint]}`}>
          {icon}
        </span>
        <span className={`h-2 w-2 rounded-full ${stat.alert ? 'bg-danger' : 'bg-pine'}`} />
      </div>
      <div className="mt-3 text-heading font-bold text-content">{label}</div>
      <div className="truncate text-caption text-muted">{stat.text}</div>
    </Link>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit** (ask permission first)

```bash
git add src/components/organizer/detail/FeatureCard.tsx
git commit -m "feat(org): add FeatureCard hub tile"
```

---

### Task 4: `FeatureShell.tsx` — full-screen window chrome

**Files:**
- Create: `src/components/organizer/detail/FeatureShell.tsx`

**Interfaces:**
- Consumes: `useNavigate`, `useParams` from `react-router-dom`; `CAMP_FEATURES` from `./campFeatures`; `useTranslation`.
- Produces: `FeatureShell` component — props `{ featureKey: string; children: ReactNode }`. Renders a sticky header (back arrow → `/org/camps/:campId`, title from the feature registry) and the children below.

- [ ] **Step 1: Create the shell**

```tsx
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { CAMP_FEATURES } from './campFeatures'

/*
  Full-screen chrome for a single camp feature. Sticky header with a back arrow
  that returns to the camp hub (/org/camps/:campId) and the feature title resolved
  from the campFeatures registry (i18n). The feature's own content (and any of its
  controls, e.g. Schedule's "+") renders below, scrolling under the header.
*/
export function FeatureShell({ featureKey, children }: { featureKey: string; children: ReactNode }) {
  const { t } = useTranslation()
  const { campId = '' } = useParams()
  const navigate = useNavigate()
  const feature = CAMP_FEATURES.find((f) => f.key === featureKey)
  const title = feature ? feature.label(t) : ''

  return (
    <div className="pb-24 md:pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface-2/95 px-5 py-3 backdrop-blur-md md:px-8">
        <button
          type="button"
          onClick={() => navigate(`/org/camps/${campId}`)}
          aria-label={t.org.detail.back}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-input border border-line bg-surface text-content active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="truncate text-heading font-bold text-content">{title}</h1>
      </header>
      <div className="px-5 pt-4 md:px-8">{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS. If `t.org.detail.back` errors, confirm the key exists (it does today — used by CampDetailShell).

- [ ] **Step 3: Commit** (ask permission first)

```bash
git add src/components/organizer/detail/FeatureShell.tsx
git commit -m "feat(org): add FeatureShell full-screen feature chrome"
```

---

### Task 5: `CampHub.tsx` — the main section (header + SOS strip + feature grid)

**Files:**
- Create: `src/components/organizer/detail/CampHub.tsx`

**Interfaces:**
- Consumes: `useCampDetail()` (Outlet context) from `./campDetailContext` for `camp`; `useOrganizerSummary`, `useActiveHelpRequests`, `useLeaderboard` + `deriveLeaderboard`; `CAMP_FEATURES`, `FeatureStatContext` from `./campFeatures`; `FeatureCard`; `useTranslation`, `interpolate`; `useOrg()` for `openCampMap`.
- Produces: `CampHub` component (default camp-detail index route). Renders the camp header (moved from `CampDetailShell`), a conditional SOS strip, and the feature grid.

> **Note:** confirm the Outlet-context hook name in `./campDetailContext.ts` (e.g. `useCampDetail`) and the SOS/help field names on `useActiveHelpRequests()` items (used by `HelpBanner`/`CampsScreen` today) before writing — match them exactly.

- [ ] **Step 1: Create the hub**

```tsx
import { useCampDetail } from './campDetailContext'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { useOrganizerSummary } from '../../../api/queries/camps.queries'
import { useActiveHelpRequests } from '../../../api/queries/helpRequests.queries'
import { useLeaderboard, deriveLeaderboard } from '../../../lib/leaderboard'
import { useOrg } from '../orgContext'
import { CAMP_FEATURES, type FeatureStatContext } from './campFeatures'
import { FeatureCard } from './FeatureCard'

/*
  The camp hub — the /org/camps/:campId index. Camp header (status + stats), a
  priority SOS strip shown only when a help request is live, and the feature grid
  driven by CAMP_FEATURES. Each card's stat is a pure selector over already-fetched
  queries (no new fetches). Replaces the old tab strip.
*/
export function CampHub() {
  const { camp } = useCampDetail()
  const { t } = useTranslation()
  const d = t.org.detail
  const c = t.org.camps
  const { openCampMap } = useOrg()

  const { data: summary } = useOrganizerSummary()
  const { data: help } = useActiveHelpRequests()
  const { data: leaderboard } = useLeaderboard()

  const standings = leaderboard ? deriveLeaderboard(leaderboard) : null
  const leaderName = standings?.rows[0]?.name ?? null
  const alertCount = help?.length ?? 0
  const activeHelp = help?.[0] ?? null

  const statCtx: FeatureStatContext = { t, camp, summary, alertCount, leaderName }

  const statusLabel = {
    active: c.statusActive,
    upcoming: c.statusUpcoming,
    draft: c.statusDraft,
    archived: c.statusArchived,
  }[camp.status]

  return (
    <div className="pb-24 md:pb-8">
      {/* Header: cover band + overlapping meta card (moved from CampDetailShell) */}
      <div className="relative h-28 bg-gradient-to-br from-pine to-pine-light md:h-32" />
      <div className="relative -mt-10 px-5 md:px-8">
        <div className="rounded-card border border-line bg-surface p-4 shadow-[0_6px_18px_rgba(20,40,30,0.08)]">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-meta font-bold ${
                camp.status === 'active' ? 'bg-green-tint text-pine' : 'bg-soft text-muted'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${camp.status === 'active' ? 'bg-pine' : 'bg-muted'}`} />
              {statusLabel}
            </span>
            {camp.dayTotal > 0 ? (
              <span className="text-caption text-muted">
                {interpolate(c.dayProgress, { current: camp.dayCurrent, total: camp.dayTotal })}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-subhead font-bold text-content">{camp.name}</h1>
          <p className="mt-0.5 text-caption text-muted">📍 {camp.location} · {camp.dateRange}</p>
          <div className="mt-3 flex gap-6">
            <Stat value={camp.participantCount} label={d.statParticipants} />
            <Stat value={camp.groupCount} label={d.statGroups} />
            <Stat value={`${camp.checkinPct}%`} label={d.statCheckedIn} accent />
          </div>
        </div>
      </div>

      {/* SOS priority strip — only when a help request is live (safety is sacred) */}
      {activeHelp ? (
        <div className="mt-3.5 px-5 md:px-8">
          <button
            type="button"
            onClick={() => openCampMap(camp.id)}
            className="flex w-full items-center gap-3 rounded-card border border-danger/30 bg-danger-tint p-3.5 text-left active:scale-[0.99]"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-danger text-white">⚠️</span>
            <div className="min-w-0 flex-1">
              <div className="text-body font-bold text-danger-deep">{c.liveMap}</div>
              <div className="truncate text-meta text-muted">
                {interpolate(c.liveMapMeta, { onsite: summary?.onSite ?? 0, alerts: alertCount })}
              </div>
            </div>
            <span className="flex-none text-caption font-bold text-danger-deep">→</span>
          </button>
        </div>
      ) : null}

      {/* Feature grid — big dashboard cards, 2-up (3-up on wide desktop) */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 px-5 md:gap-3.5 md:px-8 lg:grid-cols-3">
        {CAMP_FEATURES.map((f) => (
          <FeatureCard
            key={f.key}
            to={f.to}
            icon={f.icon}
            tint={f.tint}
            label={f.label(t)}
            stat={f.stat(statCtx)}
          />
        ))}
      </div>
    </div>
  )
}

function Stat({ value, label, accent = false }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-subhead font-bold ${accent ? 'text-pine' : 'text-content'}`}>{value}</div>
      <div className="text-meta text-muted">{label}</div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS. Likely fixes: the Outlet-context hook may be named differently than `useCampDetail` (check `campDetailContext.ts`) — align the import/usage. Confirm `c.liveMap`, `c.liveMapMeta`, `c.dayProgress`, `c.status*`, `d.stat*` keys exist (they do — used by CampsScreen/CampDetailShell today).

- [ ] **Step 3: Commit** (ask permission first)

```bash
git add src/components/organizer/detail/CampHub.tsx
git commit -m "feat(org): add CampHub (camp home with feature grid + SOS strip)"
```

---

### Task 6: Slim `CampDetailShell` to a data boundary; delete the tab strip

**Files:**
- Modify: `src/components/organizer/detail/CampDetailShell.tsx`
- Delete: `src/components/organizer/detail/CampDetailTabs.tsx`

**Interfaces:**
- Produces: `CampDetailShell` renders only the load skeleton/error and an `<Outlet context={{ camp }} />` (the `CampDetailContext` shape is unchanged, so `CampHub` and any feature reading it keep working). The header + `<CampDetailTabs/>` are removed (header now lives in `CampHub`).

- [ ] **Step 1: Rewrite `CampDetailShell` to load-and-provide only**

Replace the component body so the returned JSX (on success) is just the outlet — keep the existing `useOrganizerCamp`, `isPending` → `<HeaderSkeleton/>`, and `isError` branches:

```tsx
  const camp = campQuery.data
  const ctx: CampDetailContext = { camp }
  return <Outlet context={ctx} />
```

Remove: the header markup (cover band + meta card + `Stat`), the `<CampDetailTabs />` render, and the now-unused imports (`interpolate`, `CampDetailTabs`, `statusLabel`, `Stat`, `BackIcon`, and the `c`/`d` translation aliases if unused). Keep `HeaderSkeleton` for the pending state, or simplify it to a plain skeleton — either is fine as long as it renders during `isPending`.

- [ ] **Step 2: Delete the tab strip**

```bash
git rm src/components/organizer/detail/CampDetailTabs.tsx
```

- [ ] **Step 3: Typecheck + lint (catches unused imports)**

Run: `npm run typecheck && npm run lint`
Expected: PASS, no unused-symbol errors. If lint flags a leftover import, remove it.

- [ ] **Step 4: Commit** (ask permission first)

```bash
git add src/components/organizer/detail/CampDetailShell.tsx
git commit -m "refactor(org): slim CampDetailShell to data boundary; drop tab strip"
```

---

### Task 7: Rewire routes — index → CampHub, wrap features in FeatureShell

**Files:**
- Modify: `src/App.tsx:57-75` (the `/org` route subtree) and its imports at the top.

**Interfaces:**
- Consumes: `CampHub`, `FeatureShell` from `./components/organizer/detail/...`; existing tab components (`ParticipantsTab`, `GroupsTab`, `LeaderboardTab`, `ScheduleTab`, `AnnouncementsTab`) and `OrgComingSoon`.
- Produces: `/org/camps/:campId` index renders `CampHub`; each feature route renders its content wrapped in `<FeatureShell featureKey="…">`.

- [ ] **Step 1: Add imports**

At the top of `src/App.tsx`, add:

```tsx
import { CampHub } from './components/organizer/detail/CampHub'
import { FeatureShell } from './components/organizer/detail/FeatureShell'
```

- [ ] **Step 2: Replace the camp-detail route block**

Replace the current `camps/:campId` `<Route>` subtree (lines ~62-70) with:

```tsx
<Route path="camps/:campId" element={<CampDetailShell />}>
  <Route index element={<CampHub />} />
  <Route path="participants" element={<FeatureShell featureKey="participants"><ParticipantsTab /></FeatureShell>} />
  <Route path="groups" element={<FeatureShell featureKey="groups"><GroupsTab /></FeatureShell>} />
  <Route path="map" element={<FeatureShell featureKey="map"><OrgComingSoon /></FeatureShell>} />
  <Route path="leaderboard" element={<FeatureShell featureKey="leaderboard"><LeaderboardTab /></FeatureShell>} />
  <Route path="schedule" element={<FeatureShell featureKey="schedule"><ScheduleTab /></FeatureShell>} />
  <Route path="announcements" element={<FeatureShell featureKey="announcements"><AnnouncementsTab /></FeatureShell>} />
</Route>
```

(The `index` no longer redirects to `participants` — it renders the hub. `featureKey` values must match `CAMP_FEATURES[].key` from Task 2.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit** (ask permission first)

```bash
git add src/App.tsx
git commit -m "feat(org): route camp detail through hub + FeatureShell (drop tabs)"
```

---

### Task 8: Full verification pass (browser, both themes, deep-links) + validate

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: Vite on http://localhost:5173. (Backend on :4000 is optional — the app runs on mocks.)

- [ ] **Step 2: Verify the flow in the browser** (use the phone-preview approach from memory, or a desktop browser)

Confirm each:
- Navigate to an organizer camp (`/org/camps/<id>`) → the **hub** renders (header + card grid), **not** the Participants tab.
- Each feature card navigates to its full-screen window; the **back arrow returns to the hub**.
- The **SOS strip** appears only when a help request is active and opens the map.
- Enter a feature URL directly (e.g. `/org/camps/<id>/leaderboard`) → renders correctly (deep-link/push path intact).
- Card stats show real numbers (participants/groups counts, on-site, leader).

- [ ] **Step 3: Toggle dark mode and re-check** — hub + a feature window in dark theme: no raw-hex color that fails to flip, SOS strip legible, borders/tints correct.

- [ ] **Step 4: Run the full gate**

Run: `npm run validate`
Expected: PASS (lint + format:check + typecheck). Note the known Windows CRLF `format:check` caveat in `CLAUDE.md` — on Windows, format only the files you touched with `npx prettier --write --end-of-line auto <files>` rather than tree-wide.

- [ ] **Step 5: Final commit** (ask permission first — only if any format fixes were applied)

```bash
git add -A
git commit -m "chore(org): formatting + verification for camp hub navigation"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Architecture / single source of truth → Task 2 (`campFeatures`). ✓
- CampDetailShell slimmed to data boundary → Task 6. ✓
- CampHub (header + SOS strip + grid) → Task 5. ✓
- FeatureShell (back → hub, title) → Task 4. ✓
- FeatureCard (icon/label/stat/alert dot) → Task 3. ✓
- Route rewire, index → hub, URLs unchanged → Task 7. ✓
- i18n new keys, EN/UZ/RU → Task 1. ✓
- Tab strip deleted → Task 6. ✓
- Data from existing queries only, no new endpoints → Tasks 2 & 5 use `useOrganizerSummary`/`useActiveHelpRequests`/`useLeaderboard`. ✓
- Responsive (2→3 col grid), dark mode → Task 5 grid classes + Task 8 verification. ✓
- Out of scope (desktop master-detail, org home rebuild, action slot) → not implemented, per spec. ✓

**Type consistency:** `CampFeature.key`/`.to` used consistently; `featureKey` in Task 7 matches `CAMP_FEATURES[].key` in Task 2; `FeatureStat`/`FeatureStatContext` defined in Task 2 and consumed in Tasks 3 & 5 with matching shapes.

**Known verify-before-code points (flagged inline):** the Outlet-context hook name in `campDetailContext.ts` and the `useActiveHelpRequests` item shape — Task 5 says confirm exact names before writing.
