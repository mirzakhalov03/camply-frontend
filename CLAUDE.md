# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Camply frontend — the React PWA for the "operating system for camps" (three roles:
organization → organizer → participant). Product context — roles, the design
system, and the PWA/i18n/SOS guardrails — lives in the monorepo root: `../CLAUDE.md`
and `../CONTEXT.md`. **Read those guardrails before building UI.** This file covers
the frontend stack and conventions.

## Commands

- `npm run dev` — Vite dev server on **:5173**. `/api/*` is proxied to the Express
  backend on **:4000** (`vite.config.ts`).
- `npm run build` — type-checks (`tsc -b`) then builds. Type errors fail the build.
- `npm run typecheck` — `tsc -b --noEmit`, no artifacts.
- `npm run lint` — **oxlint** (not ESLint), config in `.oxlintrc.json`.
- `npm run format` / `format:check` — Prettier.
- `npm run validate` — lint + format:check + typecheck. This is the **pre-commit
  hook** (`.husky/`); a commit fails unless all three pass. Run it before committing.

No test runner is configured, by project preference — don't add or suggest tests.

> **Known caveat — `format:check` fails tree-wide on Windows.** The repo is checked
> out with CRLF (`core.autocrlf=true`, no `.gitattributes`) while Prettier defaults
> to `endOfLine: lf`, so `format:check` warns on _every_ file regardless of content.
> Don't "fix" this by running `format --write` across the tree — that rewrites line
> endings on 80+ files and buries real diffs. Format only files you touched, and
> preserve endings: `npx prettier --write --end-of-line auto <files>`. (A proper fix
> — a `.gitattributes` + `endOfLine: auto` — is a separate infra decision.)

## Stack notes (things that bite if you assume defaults)

- **Tailwind v4, CSS-first.** No `tailwind.config.js`. Tailwind is a Vite plugin
  and the entry is `@import 'tailwindcss'` in `src/index.css`. Theme + tokens are
  defined there in `@theme { ... }`, not a JS config.
- **React 19** + `react-jsx` runtime — no `import React` for JSX.
- **TypeScript strict-ish**: `noUnusedLocals`/`noUnusedParameters` and
  `verbatimModuleSyntax` are on — use `import type { ... }` for type-only imports.
- **Path alias `@/` → `src/`** (tsconfig `paths` + Vite `resolve.alias`). New and
  moved code imports via `@/...` (e.g. `@/utils/interpolate`, `@/hooks/useMe`,
  `@/api/queryClient`). Adoption is **convert-as-you-touch** — untouched files may
  still use relative imports; convert a file's imports when you edit it, don't
  mass-rewrite. (`paths` has no `baseUrl` — deprecated in this TS version; it
  resolves relative to the tsconfig instead.)
- Prettier: no semicolons, single quotes, trailing commas, width 100.

## Architecture

### Data & state philosophy (read before reaching for a library)

Camply is **real-time / freshness / offline heavy — NOT volume heavy.** Camp data
is bounded (a camp is dozens–hundreds of participants, one schedule, one
leaderboard); the hard problems are **liveness** (map pins, chat, leaderboard, SOS),
**offline resilience** on weak networks (ReadyProduct §9), and **privacy-scoped
freshness** (location only to the right people, only during camp hours). Optimize for
those, not for row count.

- **Server data → React Query only.** Never mirror it into Zustand — two sources of
  truth drift. Zustand is for client-owned UI state (theme, language, sheet open/
  close, SOS hold, the socket _connection_) — never rosters/chat/leaderboards.
- **Don't add Redux / a normalized global store.** That solves high-volume,
  heavily cross-referenced entities; React Query's per-key cache already gives
  sharing + dedup for bounded camp data.
- **Don't add GraphQL.** No over-fetching problem worth a new stack — REST/axios
  through `src/api/` is the boundary. (tRPC is a _maybe-later_, only if the backend
  is TS and we want end-to-end types — a backend decision, not now.)
- **Realtime is a bridge INTO the query cache, not a parallel state system** (see
  `api/realtime/`). Analytics, cross-camp, and big lists are `[LATER]` (§10) — don't
  build volume infra (virtualization, heavy pagination) unscoped.

### Data layer — `src/lib/<domain>.ts` (the data boundary)

Each feature's server data flows through one module in `src/lib/` (e.g. `chat.ts`,
`campHome.ts`, `leaderboard.ts`, `membership.ts`). The pattern, which every new
data feature should follow:

1. Export **TypeScript types** describing what the backend _will_ serve — the "data
   contract." Components depend on these types, never on where data comes from.
2. Export an async `fetch<X>()` that is the single boundary. **Today it returns
   mock data** (`src/lib/mock*.ts`) with the real call commented out:
   `// return api.get<X>('/…')`. Flipping mock → real changes nothing in the UI.
3. Export a `use<X>()` **React Query** hook wrapping `fetch<X>()`, cached by
   `queryKey` so multiple components share one fetch.

`src/api/queryClient.ts` holds the shared `QueryClient` (wired in `main.tsx`).

> `src/lib/` is now the shrunken **mock-era transitional zone** — only what hasn't
> migrated yet: the data-contract modules (`campHome`, `chat`, `leaderboard`,
> `membership`, `groups`), the old fetch wrapper `api.ts` (kept only because those
> modules' commented mock→real seam lines reference it — it goes when the last of
> them migrates), and `lib/mocks/` (the live fixtures behind the seam). As each
> endpoint lands, its `lib` module migrates into an `api/services` + `api/queries`
> pair. **Don't add new features to the `lib` shape** — new data features start in
> `api/`. Utilities moved to `@/utils`, hooks to `@/hooks`, `queryClient` to
> `@/api/queryClient`.

### Backend boundary — `src/api/` (axios + services + queries)

Real server interaction lives here, split by concern:

- **`api/axiosInstance.ts`** — the single HTTP client. `baseURL` is `VITE_API_URL ??
'/api'` (Vite proxies `/api/*` to Express :4000 in dev). It sends the httpOnly
  session cookie (`withCredentials`); there is no bearer token. A response
  interceptor normalizes errors to an `ApiError` (backend `message` + `status`) and
  clears the session on a **401**. Never call `fetch`/`axios` directly elsewhere.
- **`api/services/<domain>.service.ts`** — thin, typed wrappers over `axiosInstance`
  (one object per domain, e.g. `authService.login/register/me`). They own the
  endpoint + the request/response **types** (the data contract) and read `res.data`.
  No React here.
- **`api/queries/<domain>.queries.ts`** — the React Query layer over a service:
  `useQuery` for reads, `useMutation` for writes. Components call **these hooks
  only** — never the service or axios. Reads are cached by a `<domain>Keys` object;
  mutations commit results (e.g. `useLogin` → `setSession`).

- **`api/queryKeys.ts`** — the query-key **registry**. Every cached resource gets
  its key from a factory here (`authKeys`, `campKeys`) — never inline a `['...']`
  array in a hook. Camp data is **camp-scoped and nested** under
  `campKeys.all(campId)`, so one `invalidateQueries({ queryKey: campKeys.all(id) })`
  refreshes an entire camp (roster, schedule, leaderboard, map, chat); narrower keys
  invalidate just their slice.
- **`api/realtime/realtimeBridge.ts`** — the single WebSocket. Server-pushed events
  route into the **same** query cache the UI reads: `setQueryData` for high-frequency
  streams (map pins — _not_ invalidate), `invalidateQueries` for low-frequency nudges
  (leaderboard), append for chat. No new store, no component changes. Stub today —
  `connectRealtime(campId)` isn't called yet; wire it from a camp-scoped provider.

Flow: **component → query hook → service → axiosInstance → backend**, with realtime
writing into the cache from the side. Auth is the worked example (`auth.service.ts` +
`auth.queries.ts`); mirror it for each new domain. Note `useCurrentUser()` (GET
`/auth/me`) is the _server_ identity — distinct from `useMe()` (the client profile
assembler); don't conflate them.

### Client state — Zustand stores

UI-owned state only (never mirror server data here). Stores: `useProfileStore`
(registration data = the current user's editable profile), `useOrganizerStore` (the
organizer's onboarding identity — `role` + `group`; the organizer twin of
`useProfileStore`, committed on profile submit via ProfileForm's `onCommit` seam),
`useAuthStore` (the auth **session** identity — `user`; the cookie is the real session,
re-validated on boot via `useCurrentUser`), `useThemeStore` (dark mode), `useChatStore`, `useGroupStore`, and
`i18n/useLanguageStore`. Anything that must survive a reload / PWA relaunch uses the
`persist` middleware (theme, language, **auth**). `store/` holds **only** Zustand
stores; selectors like `useMe` live in `@/hooks`.

**The "me" overlay pattern:** mock rosters ship a placeholder `isMe` member;
`withMyProfile()` overlays the real person onto it, stopping once the backend serves
the real roster. Source the current user from **`useMe()`** (`src/hooks/useMe.ts`) —
it assembles the identity from `useProfileStore` in one place. Don't re-select
name/surname/photo/city/age/socials individually in a screen; call `useMe()`.

### UI primitives — `src/components/ui/`

Shared building blocks: **`Avatar`** (photo-or-initials on a color tile),
**`Sheet`** (bottom sheet: backdrop, slide-up, Escape/focus handling), **`Button`**
(`primary`/`accent`/`ghost` × sizes; pass `href` for a link), **`Field`** (text
input with the pine focus ring), **`Badge`** (status pill: `pine`/`amber`/`danger`/
`muted`), **`Skeleton`** (loading block), **`GroupPhotoButton`** (group-identity
photo tile with emoji fallback; pass `onPick` to make it an uploader with a "+"
badge, omit for a read-only tile — shared by the participant + organizer chat
headers). Import from the barrel: `import { Button, Avatar } from '.../components/ui'`.

**Don't hand-roll these inline.** If you're about to write an avatar, an overlay
sheet, a styled button/input, a status pill, or a loading block, use the primitive
(or extend it with a new variant there). A few genuinely bespoke spots stay custom
and say so in a comment — e.g. the gradient/emoji identity avatars in `IdentityCard`
and `ChatHeader`, and the SOS sheet (its press-and-hold flow is not a generic Sheet).

### Navigation — React Router (`react-router-dom`)

`main.tsx` wraps the app in `BrowserRouter`; `App.tsx` is the route table, split by
surface — the participant `/camp`, organizer `/org`, and organization `/admin` trees
sit as siblings:

- `/` → `Onboarding` (login → congrats → form). The onboarding pager stays **local
  state**, not routes, so its slide animation is preserved; "Enter the camp"
  `navigate('/camp/home')`. `/` is now **participant-only** — the old mock organizer
  login (`isKnownOrganizer` / fabricated `org-me` session) is **gone**. A signed-in
  organizer who lands on `/` is bounced to their surface.
- `/invite/:token` → `InviteAccept` (**public**, outside all guards) — where the
  emailed organizer magic link lands. Greets by name (`GET /invite/:token`) and, on a
  **one-tap accept** (no phone to type — the org recorded it at invite time), starts a
  real organizer session →
  `/org/welcome`. `/org/welcome` → `OrganizerOnboarding` (organizer-guarded but **not**
  profile-gated, since a fresh organizer's profile is incomplete): the real
  `completeProfile` step. The `/org/*` tree is now `requireProfile`, so an incomplete
  organizer is redirected to `/org/welcome`. Organizer camp/roster **writes** are wired
  (`campsService.create` / `rosterService.add` → the "+ New camp" and "+ Add
  participant" sheets). Design/plan:
  `../docs/superpowers/{specs,plans}/2026-07-12-organizer-onboarding-chain*.md`.
- `/camp` → `ParticipantDashboard` **layout** rendering `<Outlet>`; children
  `home`/`chat`/`ranks`/`profile` (tabs) and `map`/`schedule`/`announcements`/
  `notifications` (secondary). Every screen is a **real URL** so push notifications
  deep-link to it. `BottomNav` uses `NavLink` — active state is driven by the URL.
- `/admin` → the **organization admin surface** (third surface). Its own login page
  at `/admin/login` (username + password — no link from the participant landing),
  guarded by `RequireAdmin` (exact role `organization`, not `minRole`). `AdminShell`
  mirrors `OrganizerShell` (sidebar + bottom nav, `<Outlet context>` via
  `adminContext.ts`). Three screens, index → `dashboard`: **`dashboard`** (landing —
  live stat tiles + recent organizers, all derived from the real `GET /organizers`
  via `useOrganizers()`, plus a mock camps count; quick action reuses
  `NewOrganizerSheet`), **`camps`** (org-wide read-only camp list — see below), and
  **`organizers`** (the invite/list/deactivate dashboard, `organizers` service/query
  pair keyed by `adminOrganizerKeys`). Organizers are onboarded by **emailed magic
  link**: `NewOrganizerSheet` collects `{name, surname, email, phone}` (phone reuses
  the auth `PhoneInput`; a 409 maps to `duplicate` vs `duplicatePhone` by the backend
  message) and `OrganizerRow` is **status-driven** — _pending_ (amber, email + phone,
  Resend/Revoke), _active_ (pine, phone, Deactivate), _deactivated_ (muted,
  Reactivate). The invited organizer completes onboarding on a **public** page at
  **`/invite/:token`** (`components/organizer/InviteAccept.tsx`, outside all auth
  guards) — **one-tap accept** (phone already on file) → session starts → land on
  `/org/welcome` to finish onboarding. Data:
  `invite.service.ts` + `invite.queries.ts` (`useInvite`/`useAcceptInvite`), keyed by
  `inviteKeys`. Logout here is a **real** `POST /auth/logout`
  (the org has a genuine cookie session that `useCurrentUser` revalidates on boot — a
  local-only clear would sign it back in).

  > **Camps is on the mock→real seam.** The backend has **no camps API yet** (no Camp
  > model, no `/camps` route). `adminCamps.service.ts` returns `mockAdminCamps` with
  > the real `GET /camps` call commented out, keyed by `adminCampKeys` (kept separate
  > from the organizer's own `organizerKeys`). It's read-only by design — no "create
  > camp" button (the org rarely creates camps, and a dead button violates the "hidden
  > button ≠ permission" guardrail). Flip the one commented line when the endpoint lands.

The shell shares state with routed screens via **Outlet context** (`useCamp()` in
`src/components/participant/campContext.ts`) — this is how the single `useSos()`
instance reaches both the Profile help card and the always-mounted sheet, and how
screens get navigation helpers. `/camp` is guarded: no login (no profile `phone`) →
redirect to `/`. Add screens as routes; keep route paths centralized in the shell/
`campContext`, not sprinkled across screens.

### Utilities & hooks — `src/utils/`, `src/hooks/`

- **`src/utils/`** — pure, framework-free helpers: `interpolate` (i18n token
  substitution), `relativeTime`, `phone` (canonicalize/format), `initials`,
  `formatFileSize`, `cities`, `geolocation`. No React, no side effects.
- **`src/hooks/`** — reusable React hooks: `useSheetDrag` (bottom-sheet gesture),
  `useTypewriter`, `useMe` (the client identity **selector** — assembles the
  current user from `useProfileStore`; it lives here, not in `store/`, because it
  is a selector, not a Zustand store), and the push pair `usePushNotifications`
  (+ its internal `pushClient` browser Web-Push client).

Import both via the `@/` alias (`@/utils/x`, `@/hooks/x`).

### i18n — trilingual, non-negotiable (`src/i18n/`)

Every string ships **UZ / RU / EN** (Context.md guardrail) — **no hard-coded copy**.
Strings live in `translations.ts`, typed so the compiler forces every language to
cover every key. Components read them via `useTranslation()` → `t`. Use
`interpolate(template, vars)` for `{token}` placeholders so each language can place
tokens where its grammar needs. `useTranslation` also keeps `<html lang>` in sync.

### Design system + theming (`src/index.css`)

All tokens (Context.md §5) live in the `@theme` block. **Use tokens, not raw values.**

- **Colors** — brand (`pine`, `deep`, `amber`, `amber-bright`, `amber-ink`, `sky`),
  semantic surfaces (`bg-surface`, `bg-surface-2`, `text-content`, `text-muted`,
  `border-line`, `bg-soft`, tints), and safety (`danger`, `danger-deep`,
  `danger-tint`). **No raw hex** — a hardcoded `#0f6b4f` is `bg-pine`, `#fffdf8` is
  `bg-surface-2`, etc. Raw hex is a latent dark-mode bug: `.dark` only redefines the
  token variables, so hardcoded colors never flip. (Legit exceptions: real
  third-party brand colors like the socials in `SocialLinks`, and a couple of
  documented gradient light-tints — leave those, with a comment.)
- **Type scale** — `text-meta` (11) · `text-caption` (12) · `text-body` (13) ·
  `text-title` (15) · `text-heading` (16) · `text-subhead` (18) · `text-display`
  (22). **Use these, not `text-[13px]`.** Weight is separate (`font-semibold` etc.).
- **Radii** — `rounded-input` (16) for inputs/rows, `rounded-card` (24) for cards/
  sheets.

Dark mode is class-based (`.dark` on `<html>`, toggled by `useThemeStore`) via
`@custom-variant dark`, not OS `prefers-color-scheme`. Extend the `@theme` block for
new tokens; don't reach for arbitrary values.

### Components — `src/components/<domain>/`

Grouped by domain: `auth`, `signup`, `organizer`, `participant`, `organization` (plus shared
primitives in **`ui/`**). The participant app is further split by feature: `chat`,
`home`, `profile`, `ranks`, `sos`. Keep this grouping; keep components reusable but
not over-abstracted.

### Responsive (three surfaces are deliverables, not reflow)

Context.md §4 / ReadyProduct §9 require deliberate mobile **and** tablet/desktop
layouts. The participant shell centers in a `max-w-2xl` container as a first step,
but real tablet/desktop treatments are still owed — build them intentionally, don't
just let mobile reflow.

### Docs

Design specs and implementation plans live in `docs/superpowers/plans/`.

## Keep this file current

This file is only useful if it matches the code. Before finishing any larger task
that changes the architecture — a new data module convention, a new store, routing,
i18n structure, changed commands/tooling, or a new cross-cutting pattern — update the
relevant section here in the **same** change. Treat "update CLAUDE.md" as part of the
task, not an afterthought. Small, local edits don't need it; shifts in how the
codebase is organized or how work is done do.
