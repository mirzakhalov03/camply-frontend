# Organization surface → working prototype — Design

**Date:** 2026-07-12
**Surface:** Organization super-admin (`/admin/*`) — the third surface, sibling to
participant (`/camp`) and organizer (`/org`).
**Status:** Approved, ready for implementation plan.

---

## 1. Context (read this first if you're picking this up cold)

Camply is the "operating system for camps" — a B2B PWA with three roles:
**organization** (super-admin, dev-provisioned) → **organizer** → **participant**.
This spec covers the **organization surface** only.

### What the organization role is
The top of the hierarchy. Provisioned by developers via `npm run seed:org` (you can't
sign up as one). It logs in by **username + password** (not phone). It creates and
deactivates organizers. See `../../CONTEXT.md` §3 and the root `../../CLAUDE.md`.

### Where the code lives
- Frontend surface: `src/components/organization/` (`AdminShell`, `AdminNav`,
  `AdminLogin`, `adminContext.ts`, `organizers/*`).
- Routes: `src/App.tsx` (the `/admin/*` block).
- Data layer: `src/api/services/organizers.service.ts`,
  `src/api/queries/organizers.queries.ts`, keys in `src/api/queryKeys.ts`.
- i18n: `src/i18n/translations.ts` (the `admin:` block, type `AdminStrings`).

### The starting state (verified 2026-07-12)
The surface is a **routed skeleton with one working screen**:
- `/admin/login` (`AdminLogin`) → posts `POST /auth/login` (username+password).
- `/admin` guarded by `RequireAdmin` (exact role `organization`) → `AdminShell`
  (responsive: desktop **sidebar** + mobile **bottom nav**, both from `AdminNav`).
- `/admin` index redirects to `/admin/organizers`.
- `/admin/organizers` (`OrganizersScreen`) — **fully wired to the real backend**:
  - `GET /organizers` via `useOrganizers()` (list)
  - `POST /organizers` via `useCreateOrganizer()` (the `NewOrganizerSheet` — name,
    surname, phone, password; 409 duplicate handled inline)
  - `PATCH /organizers/:id {active}` via `useSetOrganizerActive()` (`OrganizerRow`
    deactivate/reactivate; server revokes the organizer's sessions).

So the **organizer-adding feature already exists and is real** — the work is to
verify it end-to-end, add a Dashboard and a Camps list around it, and grow the nav.

### The hard backend constraint (the key finding)
**The backend has NO camps functionality.** Only two domains exist server-side:
`auth` and `organizers` (`camply-backend/src/routes/` has only `auth.routes.ts` and
`organizer.routes.ts`; models are only `user` and `session`). There is **no Camp
model and no `/camps` route.** The "camps" in the frontend (`campsService`,
`lib/mockOrganizerCamps.ts`) are **pure mock data** with the real axios call
commented out.

**Full list of org-callable endpoints:**

| Domain | Endpoints |
|---|---|
| Auth | `POST /auth/login` (username+password), `GET /auth/me`, `PATCH /auth/me`, `POST /auth/logout`, `POST /auth/logout-all` |
| Organizers (org-only) | `GET /organizers`, `POST /organizers`, `PATCH /organizers/:id {active}` |

---

## 2. Goal & scope

**Goal:** turn the org skeleton into a **working, verified prototype** — logging in
lands on a real Dashboard backed by live data, organizer management works
end-to-end, and a Camps list exists on the codebase's mock→real seam.

**In scope (this build):**
1. **Dashboard** (`/admin/dashboard`) — new landing screen, real data.
2. **Camps** (`/admin/camps`) — new read-only list, real UI on mock-seam data.
3. **Navigation** — grow from 1 to 3 nav items; index → Dashboard.
4. **Organizers** — verify + polish (already built).
5. **i18n** — new strings in UZ/RU/EN.
6. **End-to-end verification** against a running backend + seeded org.

**Out of scope (explicitly):**
- Participants directory, Settings/org-profile screens (deferred to a later build).
- Any backend changes. **No Camp model / `/camps` endpoint is built here.**
- A "recent activity" feed (no endpoint exists — building one would fake data).
- A "Create camp" button (no backend + org rarely creates camps — a dead button
  would violate the "hidden button ≠ permission / no fake data" guardrails).
- Analytics, cross-camp portal, granular sub-roles (post-launch per CONTEXT §7).

---

## 3. Decisions made during brainstorming (and why)

1. **Camps is mock-now, real-ready seam** (chosen by user over "build camps backend"
   and "defer camps"). Build a real, polished read-only Camps screen backed by mock
   data using the existing service seam. When a `/camps` endpoint lands later, flip
   one function body — zero UI rewrite.
2. **Camps is read-only, no "Create camp" button.** Org rarely creates camps
   (user's words) and there's no backend to create one. Add-organizer lives on the
   Dashboard + Organizers instead. *(User flagged: OK.)*
3. **Index route lands on Dashboard, not Organizers.** *(User flagged: OK.)*
4. **Dashboard adds no new endpoints** — it reuses `useOrganizers()` (React Query
   dedupes, so Dashboard and Organizers share one fetch) and the mock camps query.
5. **Org's camps data layer is separate from the organizer's** (`adminCampKeys` vs
   the existing `organizerKeys`), mirroring how `adminOrganizerKeys` is already kept
   separate from `organizerKeys`. The org sees *all* camps across *all* organizers,
   with organizer attribution — a different projection than "the camps I run."

---

## 4. Design detail

### 4.1 Navigation & routing (`AdminNav.tsx`, `App.tsx`)

`useNavItems()` in `AdminNav.tsx` currently returns one item (Organizers) and drives
**both** the desktop `AdminSidebar` and mobile `AdminBottomNav`. Add two items so
both forms update from the one list:

```
Dashboard   → /admin/dashboard   (new icon)
Camps       → /admin/camps       (new icon)
Organizers  → /admin/organizers  (existing icon)
```

`App.tsx` `/admin` block:
- index `Navigate` target changes `organizers` → `dashboard`.
- add `<Route path="dashboard" element={<DashboardScreen />} />`
- add `<Route path="camps" element={<AdminCampsScreen />} />`

Logout stays in the shell (real cookie session), passed into the nav as today.

### 4.2 Dashboard (`src/components/organization/dashboard/DashboardScreen.tsx`)

Layout mirrors `OrganizersScreen`: **pine→deep gradient header**, then a padded body
with loading / error states.

- **Header:** title + a one-line subtitle (e.g. org name or a greeting).
- **Stat tiles** (grid, responsive — 2-up mobile, 4-up desktop):
  - Total organizers · Active · Deactivated — computed client-side from the
    `useOrganizers()` list (`data.length`, `filter(o => o.active)`, etc.).
  - Camps — count from `useAdminCamps()` (same mock source Camps uses; one honest
    source, not an invented number).
- **Quick actions:** **+ Add organizer** (opens the *reused* `NewOrganizerSheet`,
  lifted so both Dashboard and Organizers can open it) and **View camps** (link).
- **Recent organizers:** the latest 3–4 rows from the same `useOrganizers()` list,
  reusing `OrganizerRow` (read-only is fine; the toggle still works).
- Loading → `Skeleton` tiles; error → the same muted "couldn't load" line as
  `OrganizersScreen`.

New component owns only layout; it invents no data and no new network call.

### 4.3 Camps (`src/components/organization/camps/AdminCampsScreen.tsx` + data layer)

**Data layer (new files, mirroring the organizers pattern):**

`src/api/queryKeys.ts` — add:
```ts
export const adminCampKeys = {
  all: ['adminCamps'] as const,
  list: () => [...adminCampKeys.all, 'list'] as const,
}
```

`src/api/services/adminCamps.service.ts` — the data contract + boundary:
```ts
export type AdminCampStatus = 'active' | 'upcoming' | 'draft' | 'archived'
export type AdminCamp = {
  id: string
  name: string
  organizerName: string    // who created/runs it — the org-view attribution
  location: string
  dateRange: string        // server-formatted, e.g. "Jul 6 – Jul 19"
  status: AdminCampStatus
  participantCount: number
}
export const adminCampsService = {
  list: async (): Promise<AdminCamp[]> => {
    // return (await axiosInstance.get<{ camps: AdminCamp[] }>('/camps')).data.camps
    return adminCampsMock
  },
}
```
(Real call commented above the mock return — the established mock→real seam. Flipping
later touches only this function body.)

`src/lib/mockAdminCamps.ts` — a handful of camps attributed to different organizers,
covering each status (active / upcoming / draft) so the UI's states are all visible.

`src/api/queries/adminCamps.queries.ts` — `useAdminCamps()` = `useQuery` keyed by
`adminCampKeys.list()`.

**Screen:** same skeleton as `OrganizersScreen` — gradient header with title +
`{count}` subtitle, then loading / error / empty / list. Each camp is a **read-only
card**: name, "by {organizerName}", location, date range, a status `Badge`
(`pine` active / `amber` upcoming / `muted` draft), participant count. Use the
existing `Badge` UI primitive — don't hand-roll a pill. No create button.

### 4.4 Organizers — verify & polish

No structural change. Confirm create / deactivate / reactivate work against the real
API, and align the header styling with the Dashboard (they share the gradient-header
pattern already, so this is minor).

### 4.5 i18n (`src/i18n/translations.ts`)

Extend the `AdminStrings` type with:
- `dashboard`: title, subtitle, `stats` (organizers, active, deactivated, camps),
  `quickActions` (addOrganizer, viewCamps), `recentOrganizers`, `loadError`.
- `camps`: title, `subtitle` ("{count} camps"), `by` ("by {name}"), status labels
  (active/upcoming/draft/archived), `empty`, `emptyHint`, `loadError`,
  `participants` ("{count} participants").

Fill all three language objects (UZ, RU, EN — the block appears three times; the
compiler enforces coverage via the `AdminStrings` type). Use `interpolate()` for
`{count}`/`{name}` tokens. **No hard-coded copy anywhere.**

---

## 5. Files touched (summary)

**New:**
- `src/components/organization/dashboard/DashboardScreen.tsx`
- `src/components/organization/camps/AdminCampsScreen.tsx`
- `src/components/organization/camps/AdminCampCard.tsx` (extracted row, like `OrganizerRow`)
- `src/api/services/adminCamps.service.ts`
- `src/api/queries/adminCamps.queries.ts`
- `src/lib/mockAdminCamps.ts`

**Modified:**
- `src/App.tsx` — index redirect + two routes.
- `src/components/organization/AdminNav.tsx` — two nav items + icons.
- `src/api/queryKeys.ts` — `adminCampKeys`.
- `src/i18n/translations.ts` — `AdminStrings` type + UZ/RU/EN blocks.
- (maybe) lift `NewOrganizerSheet` open-state so Dashboard can trigger it — or keep a
  local instance per screen; decide in the plan (favor the simplest that avoids
  duplicating the sheet's logic).

---

## 6. Verification (the "working prototype" bar — required)

This is a deliverable, not an afterthought. Evidence over assertion.

**Setup:**
- Backend: MongoDB running, `MONGO_URI` set. `cd camply-backend && npm run seed:org`
  (creates org `admin` / `1234` by default) then `npm run dev` (:4000).
- Frontend: `cd camply-frontend && npm run dev` (:5173; `/api/*` proxies to :4000).

**Drive the real flow** (in a browser, not just types):
1. Visit `/admin/login`, log in as `admin` / `1234` → lands on `/admin/dashboard`.
2. Dashboard stat tiles show real organizer counts (0 on a fresh DB).
3. **Add organizer** from the Dashboard quick action → fill the sheet → it appears in
   Recent organizers and the counts increment.
4. Go to Organizers → the new organizer is listed → **deactivate** → badge flips to
   Deactivated (real `PATCH`), **reactivate** → flips back.
5. Go to Camps → the mock list renders with statuses and organizer attribution;
   empty/loading states behave.
6. Reload → session persists (org has a real cookie); logout → returns to
   `/admin/login`.

**Gates:** `npm run validate` (lint + format:check + typecheck) passes in the
frontend. Format only files you touched with `npx prettier --write --end-of-line auto
<files>` (see the frontend CLAUDE.md CRLF caveat).

---

## 7. Guardrails to honor (from root CLAUDE.md / CONTEXT.md)

- **Enforce hierarchy server-side** — the client role check in `RequireAdmin`/
  `AdminShell` is convenience only; the server is the authority. Don't loosen it.
- **Trilingual by default** — every new string ships UZ/RU/EN.
- **Three surfaces, every breakpoint** — Dashboard and Camps need deliberate mobile
  **and** tablet/desktop layouts (the sidebar already handles the desktop chrome;
  make the screen bodies responsive, not reflow accidents).
- **Honor the design system** — tokens only (`bg-pine`, `text-title`, `rounded-card`,
  etc.), no raw hex, keep dark mode working. Use the `ui/` primitives (`Button`,
  `Badge`, `Skeleton`, `Sheet`) — don't hand-roll them.
- **No new state library / no server data in Zustand** — server data through React
  Query only.

---

## 8. Open items for the plan

- Decide the `NewOrganizerSheet` sharing approach (lift vs. per-screen instance).
- Exact stat-tile grid breakpoints and dashboard copy.
- Icons for Dashboard + Camps nav items (inline SVGs in `AdminNav`, matching the
  existing `OrganizersIcon` stroke style).
