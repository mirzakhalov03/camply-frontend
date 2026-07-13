# Frontend structure cleanup — design

**Date:** 2026-07-14
**Scope:** Frontend repo only (backend untouched). Branch off `dev`.
**Status:** approved

## Problem

The frontend has good bones — the layered data boundary
(`component → query → service → axios`), surface-namespaced components, a central
query-key registry, and central design tokens. But three localized issues have
accumulated:

1. **No path alias.** Imports are relative (`../../../`). Painful at current depth,
   and it makes any file move a large mechanical import rewrite.
2. **`lib/` is a junk drawer.** 30 files mixing four unrelated concerns: pure
   utilities, hooks, the shared `queryClient`, mock-era data-contract modules
   (mid-migration), and mock fixtures. As `api/services` flipped to real endpoints,
   **12 modules orphaned** (0 importers) but were never deleted.
3. **`store/` holds a non-store.** `useMe` is a selector hook that reads
   `useProfileStore` and assembles an identity — it is not a Zustand store and does
   not belong in `store/`.

None of these is the top-level folder shape. A `src/{participant,organizer,
organization}` split was considered and **rejected**: the data layer
(`api/services`, `api/queries`, `queryKeys`) is deliberately cross-surface (one
`toPublic*` contract, many surfaces), so a view split would force most of the
interesting code into a fat `shared/` and fight the architecture's core idea. The
surface boundary already correctly lives at the `components/` layer.

## Guiding principle

**Separate the eternal from the ephemeral.**

- **Eternal** — utilities, hooks, and infra (`queryClient`) never migrate away.
  Move them to stable homes (`utils/`, `hooks/`, `api/`).
- **Ephemeral** — the mock-era data-contract modules are mid-migration and will
  dissolve into `api/services` + `api/queries` one domain at a time. Leave them in
  a clearly-marked transitional zone; do **not** reorganize them now (that is the
  migration's job, per the frontend CLAUDE.md).
- **Dead** — orphaned modules get deleted.

## Design

### 1. Path alias `@/` → `src/`

- `tsconfig.app.json` and `tsconfig.worker.json`: add
  `"baseUrl": "."` and `"paths": { "@/*": ["src/*"] }`.
- `vite.config.ts`: add `resolve: { alias: { '@': '/src' } }` (kept in sync with
  the tsconfig `paths` — the standard Vite + TS pairing; both are required, TS for
  type resolution, Vite for the bundler).
- **Adoption: convert-as-you-touch.** Only files this refactor moves or whose
  imports it updates switch to `@/`. Untouched files stay relative and convert
  organically later. This keeps the diff small and reviewable and avoids colliding
  with the collaborator's in-flight branch. The codebase is briefly mixed
  relative + alias — acceptable and self-healing.
- The convention is documented in CLAUDE.md so new work uses `@/`.

### 2. `lib/` cleanup (30 files → 9)

**Create `src/utils/`** — pure functions, moved out of `lib/`:
`interpolate.ts` (27 importers), `relativeTime.ts` (11), `phone.ts` (5),
`initials.ts`, `formatFileSize.ts`, `cities.ts`, `geolocation.ts`.

**Create `src/hooks/`** — hooks, moved out of `lib/` and `store/`:
`useSheetDrag.ts`, `useTypewriter.ts`, `push/usePushNotifications.ts`, and
`useMe.ts` (from `store/` — see §3).

**Move to `api/`** — `lib/queryClient.ts` → `src/api/queryClient.ts`. It is
shared React Query infra and belongs with the api layer. Updates its 2 importers
(`main.tsx`, `api/realtime/realtimeBridge.ts`).

**Delete 12 dead files** (0 importers, verified by static scan):
- `lib/api.ts` — the old fetch wrapper, superseded by `api/axiosInstance.ts`; now
  fully orphaned (CLAUDE.md said to delete it once the last consumer migrated —
  that has happened).
- `lib/push/pushClient.ts`.
- 10 dead mocks: `mockAnnouncements`, `mockChat`, `mockLeaderboard`,
  `mockMembership`, `mockOrganizerCamps`, `mockOrganizers`, `mockParticipants`,
  `mockRoster`, `mockSchedule`, `mockTeam`.

Then remove the now-empty `lib/push/` directory.

**Leave in `lib/` (the transitional mock-era zone):** the 5 still-in-use
data-contract modules — `campHome.ts`, `chat.ts`, `leaderboard.ts`,
`membership.ts`, `groups.ts`.

**Create `src/lib/mocks/`** and move the 4 **alive** mock fixtures into it:
`mockAdminCamps.ts`, `mockHelpRequests.ts`, `mockOrgChat.ts`, `mockCamp.ts`.
After this, `lib/` is self-documenting: `lib/*.ts` = data contracts awaiting
migration, `lib/mocks/` = fixtures behind the mock→real seam. (4 importer
updates: 3 in `api/services`, 1 in `components/participant/sos`.)

**Resulting `lib/`:** 5 contract modules + `mocks/` (4 files) = 9 files, down
from 30.

### 3. `store/` cleanup

Move `useMe.ts` → `hooks/useMe.ts` (it is a selector hook, not a store). Update
its importers. Leave the 10 real Zustand stores flat — foldering 10 well-named
files is over-engineering, not an improvement.

> Note: `useMe` imports the `MeIdentity` **type** from `lib/chat`. That coupling
> is part of the mock-era migration and is left as-is; the type moves when
> `chat.ts` migrates. Only the file location changes here.

### 4. CLAUDE.md (Frontend) — same-change doc updates

- Add the `@/` alias convention (Stack notes): `@/` → `src/`, convert-as-you-touch.
- Reframe the `lib/` section: the shrunken mock-era **transitional zone** holding
  only not-yet-migrated data-contract modules + `lib/mocks/` fixtures; `api.ts`
  deleted; "don't add here" reinforced.
- Add `utils/` and `hooks/` architecture sections.
- Update the `store/` section: `useMe` now lives in `hooks/`.
- Note `queryClient` now lives in `api/`.

## Migration order (safety spine — each step green before the next)

The build must be green at every step. Verify each with `npm run typecheck`
(the fast per-change gate; no test runner by project preference).

1. **Alias infra only** (tsconfig `paths` + vite `resolve.alias`), no file moves.
   `typecheck` green (alias present, unused).
2. **Delete 12 dead files.** `typecheck` proves nothing referenced them.
3. **`utils/`** — create, move 7 files, update importers to `@/utils/*`. `typecheck`.
4. **`hooks/`** — create, move 4 files (incl. `useMe` from `store/`), update
   importers, remove empty `lib/push/`. `typecheck`.
5. **`queryClient`** — move to `api/`, update `main.tsx` + `api/realtime`. `typecheck`.
6. **`lib/mocks/`** — create, move 4 alive mocks, update importers. `typecheck`.
7. **CLAUDE.md** updates.
8. **Final verification:** `npm run validate` (lint + format:check + typecheck) +
   `npm run build` + a dev smoke loading one participant, one organizer, and one
   admin screen.

## Guardrails & risks

- **Frontend repo only.** Backend is untouched. Work on a branch off `dev`.
- **Preserve `import type`.** `verbatimModuleSyntax` + `noUnusedLocals` are strict;
  moved files and updated importers must keep type-only imports as `import type`.
- **Formatting.** Format only touched files with
  `npx prettier --write --end-of-line auto <files>`. (macOS = LF, so the tree-wide
  CRLF `format:check` caveat does not apply here.)
- **Worker alias.** `tsconfig.worker.json` (compiles only `src/sw.ts`) gets the
  alias too, for safety, even though `sw.ts` imports nothing being moved.
- **oxlint** resolves via tsconfig; the alias should not disturb it — confirmed by
  `npm run lint` in the final step.
- **Pre-commit hook** runs `npm run validate`, enforcing the gate on every commit.

## Non-goals

- No `src/{view}` top-level split (rejected — see Problem).
- No reorganization of the mock-era data-contract modules (`campHome`, `chat`,
  `leaderboard`, `membership`, `groups`) — that is the per-domain migration's job.
- No `store/` foldering beyond removing the misplaced `useMe`.
- No mass codemod of relative imports (convert-as-you-touch only).
