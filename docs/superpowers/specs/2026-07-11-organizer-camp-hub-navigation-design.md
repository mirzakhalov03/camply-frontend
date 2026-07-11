# Organizer Camp Hub — Navigation Redesign (hub-and-spoke)

**Date:** 2026-07-11
**Surface:** Organizer (`/org/*`)
**Status:** Implemented — with the revision below

> **Revision (during implementation):** the launcher moved from a *separate* per-camp
> hub screen (`/org/camps/:id` index) onto the **organizer home** (`/org/camps`,
> `CampsScreen`) at the user's direction — "all cards on the main, no in-between
> window." Net effect vs. the design below:
> - The home *is* the launcher: `StatStrip` → `HelpBanner` (SOS) → Live map +
>   Leaderboard cards → Top groups (`StandingsWidget`) → Participants · Groups ·
>   Schedule · Announcements cards. The old "Yoshlar 2026" camp card is removed.
> - **All six** features use the one `FeatureCard` (the `QuickLinks` component was
>   replaced and deleted); the separate `CampHub` component was deleted.
> - `FeatureShell`'s back arrow returns to `/org/camps` (the home), and a bare
>   `/org/camps/:id` redirects there. Feature routes + `FeatureShell` + the
>   `campFeatures` registry are otherwise exactly as designed.

## Problem

Inside a camp (`/org/camps/:campId`), all six features live behind a horizontal
**tab strip** (`CampDetailTabs`): Participants · Groups · Map · Leaderboard ·
Schedule · Announcements. The strip already overflows on a phone, gives no sense
of a camp "home," and crams competing features onto one plane. Landing always
drops the organizer straight into the Participants tab — there is no overview.

We want a **hub-and-spoke** model instead:

- a camp **hub** (the "home") showing camp status + every feature as a live card,
- each feature opening as **its own full-screen window** with a back path to the hub.

Motivation (from review with a senior engineer): each feature becomes an
independently ownable, testable unit; the camp gets a real landing hub; features
get calm, focused space; and the feature set can grow without a cramped strip.

## Scope

**In scope:** the organizer camp-detail surface (`/org/camps/:campId` and its
feature routes). The camp-detail **tab strip is removed**; an index **hub** and a
shared full-screen **feature window** replace it.

**Out of scope (explicitly deferred):**

- Desktop master-detail (persistent sub-rail + detail pane) — the "Approach B"
  variant. Mobile-first hub-and-spoke ships now; a deliberate desktop treatment
  is a follow-up, not a blocker. Desktop for now = the same hub, grid widened to
  3 columns.
- The organizer top-level home `/org/camps` (multi-camp glance) keeps its current
  shape; its shortcuts continue to deep-link into a camp. Not rebuilt here.
- Participant surface — unchanged.
- No new backend endpoints; the hub reuses existing queries.

## Architecture

The core idea: **one source of truth drives both the hub cards and the routes.**
Adding a feature later is a single list entry that updates the grid and the
navigation together — they cannot drift apart.

### Files

```
src/components/organizer/detail/
  campFeatures.tsx     NEW — single source of truth: the feature list
  CampDetailShell.tsx  SLIMMED — data boundary only (load camp → Outlet context)
  CampHub.tsx          NEW — the "main section": camp header + feature grid
  FeatureCard.tsx      NEW — one hub card (icon, label, live stat, alert dot)
  FeatureShell.tsx     NEW — full-screen window chrome (back → hub, title, action slot)
  CampDetailTabs.tsx   DELETED — the strip is gone
  <feature>/*Tab.tsx   UNCHANGED content; each route wraps it in <FeatureShell>
```

Component responsibilities (each has one reason to change):

- **`CampDetailShell`** — loads camp meta once (`useOrganizerCamp`), owns the
  skeleton/error states, provides `camp` to children via Outlet context
  (`CampDetailContext`, unchanged). It **no longer renders the header or tabs**.
- **`CampHub`** — the index route. Renders the existing camp header (cover band +
  meta/stats card), the conditional SOS strip, and the feature grid.
- **`FeatureShell`** — full-screen chrome wrapping a feature: sticky header with a
  back arrow (→ `/org/camps/:campId`), the feature title (i18n), and an optional
  right-side `action` slot. Renders `children` (the feature content) full-height.
- **`FeatureCard`** — presentational hub card in the **generous dashboard-card
  style** (large `rounded-card`, a colored icon tile, bold title, muted micro-stat
  underneath, optional danger dot) — the exact look the existing `QuickLinks` Live
  map / Leaderboard cards already have on the org home. All six features use it;
  each carries an icon **tint** (map=green, leaderboard=amber, …) so the grid reads
  as a coherent set, not a monochrome menu. Laid out **2-up**.

### `campFeatures.tsx` — the single source of truth

A typed list, one entry per feature:

```ts
type CampFeature = {
  key: string            // 'map'
  to: string             // route segment, matches the URL: 'map'
  icon: ReactNode
  labelKey: keyof ...    // i18n key for card label + window title
  // Pure selector over already-fetched data → the card's live micro-stat.
  stat: (ctx: FeatureStatContext) => { text: string; alert?: boolean }
}
```

- `CampHub` maps it → `FeatureCard`s.
- `App.tsx` maps it → nested routes, each `<FeatureShell title={label}>{element}</FeatureShell>`.
- `FeatureShell` reads the title from the same list.

`FeatureStatContext` bundles the data the stats read (camp, summary, active help,
standings) so each `stat()` is a pure function of already-fetched query data — no
new fetches per card.

### Routing (`App.tsx`)

URLs are unchanged, so push notifications and deep links keep working. Only the
**index** behavior and the wrapping change:

```
/org/camps/:campId            → CampDetailShell (loads camp → context)
    index                     → CampHub                       (was: redirect to participants)
    participants              → <FeatureShell><ParticipantsTab/></FeatureShell>
    groups                    → <FeatureShell><GroupsTab/></FeatureShell>
    map                       → <FeatureShell><MapTab/></FeatureShell>   (still ComingSoon inside)
    leaderboard               → <FeatureShell><LeaderboardTab/></FeatureShell>
    schedule                  → <FeatureShell><ScheduleTab/></FeatureShell>
    announcements             → <FeatureShell><AnnouncementsTab/></FeatureShell>
```

The one behavioral change: `index` renders `CampHub` instead of
`<Navigate to="participants" replace />`.

## The main section — Camp Hub layout

```
┌───────────────────────────────┐
│ ▒▒▒▒ pine cover band ▒▒▒  [←] │   back → /org/camps (camp list)
│   ┌─────────────────────────┐ │
│   │ ● Active · Day 3/7      │ │   existing camp meta card (kept as-is)
│   │ Yoshlar 2026            │ │
│   │ 📍 Tashkent · Jul 6–13  │ │
│   │  246     8      92%     │ │
│   │  people  groups checked │ │
│   └─────────────────────────┘ │
│                               │
│  ⚠ 1 SOS · River Hawks        │   priority strip — ONLY when a help
│      [ View on map → ]         │   request is live (safety is sacred)
│                               │
│  ┌────────────┐ ┌────────────┐│   big dashboard-style cards (Image #4),
│  │ ▢          ●│ │ ▢           ││   laid out 2-up: colored icon tile,
│  │ Live map    │ │ Leaderboard ││   status dot, bold title, muted stat
│  │ 246 · 1 alrt│ │ Foxes lead  ││
│  └────────────┘ └────────────┘│
│  ┌────────────┐ ┌────────────┐│
│  │ ▢           │ │ ▢           ││
│  │ Participants│ │ Groups      ││
│  │ 312 total   │ │ 16 groups   ││
│  └────────────┘ └────────────┘│
│  ┌────────────┐ ┌────────────┐│
│  │ ▢           │ │ ▢           ││
│  │ Schedule    │ │ Announcemts ││
│  │ Day 3/7     │ │ Broadcasts  ││
│  └────────────┘ └────────────┘│
└───────────────────────────────┘
  [ Main ]    [ Chat ]   [ Profile ]   org bottom nav stays
```

Decisions:

- **Header on the hub only.** Feature windows use their own compact header, so the
  cover band never eats space inside Map/Leaderboard.
- **Big dashboard-style cards, 2-up** (Image #4): large `rounded-card`, a colored
  icon **tint** per feature, bold title, muted stat line, status dot top-right —
  promoting the existing `QuickLinks` look into the reusable `FeatureCard`. On
  wide desktop the grid may go 3-up; 2-up is the default and matches the mock.
- **Every card carries a real live micro-stat** (reuses existing queries). A
  launcher of dead labels reads as a settings menu; one live number each keeps it
  an ops console that "feels alive" — consistent with the current `QuickLinks`.
- **SOS is a separate priority strip above the grid**, shown only when a help
  request is active. An emergency is never reduced to a small number in a tile.
  It reuses `useActiveHelpRequests` and links to `map`.
- **Global bottom nav (Main · Chat · Profile) stays** on both hub and features —
  the organizer is never stranded. Only the *camp tab strip* is removed.

## The feature window — FeatureShell

```
┌───────────────────────────────┐
│ [←]  Live map           [ + ] │   sticky header
├───────────────────────────────┤
│   feature content, full        │
│   height, its own scroll       │
└───────────────────────────────┘
  [ Main ]   [ Chat ]   [ Profile ]
```

- **Back arrow** → `/org/camps/:campId` (hub).
- **Title** from `campFeatures` (i18n).
- **Optional `action` slot** (right side) for feature header actions (Schedule "+",
  Announcements "Compose"). Features with existing internal controls keep them; the
  slot is opt-in, not required.
- Sticky header; content area scrolls independently.

## Data

No new endpoints. Card stats are pure selectors over already-fetched queries:
`useOrganizerCamp` (camp meta), `useOrganizerSummary` (on-site, counts),
`useActiveHelpRequests` (alerts), `useLeaderboard` → `deriveLeaderboard` (leader).
These are already used by `CampsScreen`/`QuickLinks`, so React Query dedups them.

## i18n

- **Window titles / card labels** reuse the existing tab-label keys
  (`t.org.detail.tabMap`, `tabParticipants`, …) — no new label keys needed.
- **New keys** for card micro-stats where an existing string doesn't cover it
  (e.g. "{n} groups", "Next {time}", "{n} pinned", "{n} total"). All three
  languages (EN/UZ/RU), typed, per the i18n guardrail. Interpolation via
  `interpolate()` for `{token}` placeholders.

## Design system

Tokens only — no raw hex (dark-mode safety). Cards use `rounded-card`/`rounded-input`,
brand/semantic color tokens, and the existing type scale. Danger dot uses `danger`
tokens. Dark mode must remain correct (verify both themes).

## Responsive

- **Phone:** hub grid 2 columns; feature windows full-width.
- **md+ (tablet/laptop):** hub grid widens to 3 columns; feature content uses a
  sensible max-width. True desktop master-detail is deferred (see Scope).

## Naming note

The feature content components keep their `*Tab.tsx` filenames to limit blast
radius, though they are no longer "tabs" conceptually. An optional later rename
(`*Panel`/`*Screen`) is a separate cleanup, not part of this change.

## Verification

- Landing on `/org/camps/:id` shows the hub (not Participants).
- Each card navigates to its feature full-screen; back arrow returns to the hub.
- Deep-linking directly to `/org/camps/:id/map` still renders (push-notification path).
- SOS strip appears only with a live help request and links to the map.
- Card stats reflect real query data; dark mode correct; strings in all 3 languages.
- `npm run validate` passes (lint + format:check + typecheck).
```