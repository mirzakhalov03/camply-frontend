# Frontend Structure Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `@/` path alias, empty the `lib/` junk drawer into stable homes (`utils/`, `hooks/`, `api/`, `lib/mocks/`), delete dead mock fixtures, move the misplaced `useMe` selector out of `store/`, and keep CLAUDE.md in sync — without breaking anything that works.

**Architecture:** Pure structural refactor of the Frontend repo. No behavior changes, no dependency changes. Each task is a single self-contained move-or-delete that leaves the build green, verified by `npm run typecheck`. Imports for moved/touched files convert to the new `@/` alias (convert-as-you-touch); untouched files stay relative.

**Tech Stack:** React 19 · Vite 6 · TypeScript (project refs: `tsconfig.app.json` + `tsconfig.worker.json`) · Tailwind v4 · oxlint · Prettier. **No test runner** (project preference) — the per-task gate is `npm run typecheck`.

## Global Constraints

- **Frontend repo only.** Do not touch the Backend repo. All work on branch `chore/frontend-structure-cleanup` (already created, off `dev`).
- **Preserve `import type`.** `verbatimModuleSyntax` + `noUnusedLocals`/`noUnusedParameters` are on — type-only imports must stay `import type { ... }`.
- **Alias adoption is convert-as-you-touch.** Only files a task moves, or whose import line a task edits, switch to `@/`. Do **not** mass-rewrite unrelated relative imports.
- **`@/` maps to `src/`.** `@/utils/x` = `src/utils/x`, `@/lib/chat` = `src/lib/chat`, etc.
- **Use `git mv`** for every move (preserves history).
- **Verify each task** with `npm run typecheck` (must print no errors, exit 0) before committing. `tsc -b` is incremental — a clean run means all three project configs pass.
- **Format only touched files** before committing: `npx prettier --write --end-of-line auto <files>`.
- **Do NOT delete:** `lib/api.ts`, `lib/mockChat.ts`, `lib/mockMembership.ts`, `lib/push/pushClient.ts` — all are live (see spec §2 corrections).
- Commit message trailer on every commit:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

### Task 1: Add the `@/` path alias infrastructure

Add the alias to both TS project configs and to Vite. No files move yet — this task only makes `@/` resolvable, so later tasks can use it.

**Files:**
- Modify: `tsconfig.app.json`
- Modify: `tsconfig.worker.json`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: the `@/*` → `src/*` alias, resolvable by both `tsc` and Vite. Every later task consumes it.

- [ ] **Step 1: Add `baseUrl` + `paths` to `tsconfig.app.json`**

In `tsconfig.app.json`, inside `compilerOptions`, add these two keys (place them right after the opening `"compilerOptions": {` line, before `"tsBuildInfoFile"`):

```json
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
```

- [ ] **Step 2: Add the same to `tsconfig.worker.json`**

In `tsconfig.worker.json`, inside `compilerOptions`, add the same two keys after the opening `"compilerOptions": {` line:

```json
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
```

(`sw.ts` imports nothing being moved, but the alias is added here for future safety and parity.)

- [ ] **Step 3: Add `resolve.alias` to `vite.config.ts`**

`vite.config.ts` currently has no `resolve` key. Add the `node:path` import at the top (after the existing imports) and a `resolve` block. Add the import:

```ts
import { fileURLToPath, URL } from 'node:url'
```

Then add this key to the `defineConfig({ ... })` object, as a sibling of `plugins` (e.g. immediately after the closing `]` of `plugins`):

```ts
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
```

(Using `fileURLToPath(new URL(...))` is the ESM-correct way to produce an absolute path in a `.ts` Vite config — more robust than the string `'/src'` form.)

- [ ] **Step 4: Verify typecheck passes (alias present, unused)**

Run: `npm run typecheck`
Expected: exits 0, no errors. (The alias is defined but not yet used — this proves the configs are still valid.)

- [ ] **Step 5: Smoke-test the alias resolves in Vite**

Run: `npm run build`
Expected: build succeeds. (Confirms Vite parses the new `resolve` block and `node:url` import.)

- [ ] **Step 6: Format & commit**

```bash
npx prettier --write --end-of-line auto tsconfig.app.json tsconfig.worker.json vite.config.ts
git add tsconfig.app.json tsconfig.worker.json vite.config.ts
git commit -m "build: add @/ path alias (tsconfig paths + vite resolve)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Delete the 8 dead mock fixtures

These 8 mocks have zero references across the tree (verified by basename against every import form, including sibling `./` imports). Deleting them and re-running `typecheck` proves nothing depended on them.

**Files:**
- Delete: `src/lib/mockAnnouncements.ts`, `src/lib/mockLeaderboard.ts`, `src/lib/mockOrganizerCamps.ts`, `src/lib/mockOrganizers.ts`, `src/lib/mockParticipants.ts`, `src/lib/mockRoster.ts`, `src/lib/mockSchedule.ts`, `src/lib/mockTeam.ts`

**Interfaces:**
- Consumes: nothing. Produces: nothing (pure removal).

- [ ] **Step 1: Delete the 8 files**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
git rm src/lib/mockAnnouncements.ts src/lib/mockLeaderboard.ts \
  src/lib/mockOrganizerCamps.ts src/lib/mockOrganizers.ts \
  src/lib/mockParticipants.ts src/lib/mockRoster.ts \
  src/lib/mockSchedule.ts src/lib/mockTeam.ts
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0, no errors. (If it fails with "cannot find module '.../mockX'", that mock was NOT dead — stop, restore it with `git checkout src/lib/mockX.ts`, and investigate. This should not happen given the verification, but the gate catches it.)

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove 8 orphaned mock fixtures

These mocks lost their last importer when their api/services flipped to real
endpoints. Verified 0 references across all import forms.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Move pure utilities to `src/utils/`

Move the 7 pure-function modules out of `lib/` into a new `utils/` dir, and repoint every importer to `@/utils/*`.

**Files:**
- Move: `src/lib/{interpolate,relativeTime,phone,initials,formatFileSize,cities,geolocation}.ts` → `src/utils/`
- Modify (importers, repoint to `@/utils/*`): see the per-module lists in Step 2.

**Interfaces:**
- Consumes: the `@/` alias from Task 1.
- Produces: `@/utils/interpolate`, `@/utils/relativeTime`, `@/utils/phone`, `@/utils/initials`, `@/utils/formatFileSize`, `@/utils/cities`, `@/utils/geolocation` (same exports as before — only the path changes).

- [ ] **Step 1: Create `utils/` and move the 7 files**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
mkdir -p src/utils
git mv src/lib/interpolate.ts src/utils/interpolate.ts
git mv src/lib/relativeTime.ts src/utils/relativeTime.ts
git mv src/lib/phone.ts src/utils/phone.ts
git mv src/lib/initials.ts src/utils/initials.ts
git mv src/lib/formatFileSize.ts src/utils/formatFileSize.ts
git mv src/lib/cities.ts src/utils/cities.ts
git mv src/lib/geolocation.ts src/utils/geolocation.ts
```

Note: `relativeTime.ts` imports `./interpolate` — both land in `utils/`, so that sibling import stays valid and needs no change.

- [ ] **Step 2: Repoint every importer to `@/utils/*`**

For each importer file below, change the import specifier so its trailing path segment is `@/utils/<module>`. The old specifier is a relative path ending in the module name (e.g. `'../../lib/interpolate'` or `'../lib/interpolate'`); replace the whole specifier with `'@/utils/interpolate'`. Keep `import type` where it is already used. Edit exactly these files:

**interpolate** (26 files):
`components/organization/camps/AdminCampCard.tsx`, `components/organization/camps/AdminCampsScreen.tsx`, `components/organization/organizers/NewOrganizerSheet.tsx`, `components/organization/organizers/OrganizersScreen.tsx`, `components/organizer/InviteAccept.tsx`, `components/organizer/camps/CampsScreen.tsx`, `components/organizer/camps/HelpBanner.tsx`, `components/organizer/chat/OrgChatMembersSheet.tsx`, `components/organizer/chat/OrgChatScreen.tsx`, `components/organizer/detail/campFeatures.tsx`, `components/organizer/detail/groups/GroupCard.tsx`, `components/organizer/detail/leaderboard/PointsWheelSheet.tsx`, `components/organizer/detail/participants/ParticipantPeekSheet.tsx`, `components/organizer/detail/participants/ParticipantsTab.tsx`, `components/organizer/profile/OrgHelpRequestsCard.tsx`, `components/organizer/team/OrgTeamScreen.tsx`, `components/participant/chat/ChatHeader.tsx`, `components/participant/chat/Composer.tsx`, `components/participant/chat/MemberSheet.tsx`, `components/participant/chat/MembersSheet.tsx`, `components/participant/home/CampCover.tsx`, `components/participant/home/MyGroupCard.tsx`, `components/participant/home/UpNextCard.tsx`, `components/participant/ranks/YourStandingCard.tsx`, `components/participant/sos/SosSheet.tsx`, `components/signup/CityPicker.tsx`, `components/signup/ProfileSuccess.tsx`

**relativeTime** (11 files):
`components/organizer/camps/HelpBanner.tsx`, `components/organizer/detail/announcements/OrgAnnouncementRow.tsx`, `components/organizer/detail/schedule/OrgActivityRow.tsx`, `components/organizer/profile/OrgHelpRequestsCard.tsx`, `components/organizer/team/OrgTeamScreen.tsx`, `components/participant/announcements/AnnouncementDetailScreen.tsx`, `components/participant/announcements/AnnouncementListItem.tsx`, `components/participant/announcements/AnnouncementsScreen.tsx`, `components/participant/home/AnnouncementCard.tsx`, `components/participant/home/UpNextCard.tsx`, `components/participant/schedule/ActivityRow.tsx`

**phone** (5 files):
`components/auth/ParticipantLogin.tsx`, `components/auth/PhoneInput.tsx`, `components/organizer/InviteAccept.tsx`, `components/organizer/detail/participants/AddParticipantSheet.tsx`, `components/participant/profile/InfoList.tsx`

**initials** (4 files):
`components/organizer/detail/announcements/OrgAnnouncementRow.tsx`, `components/organizer/profile/OrgProfileScreen.tsx`, `components/participant/announcements/AnnouncementDetailScreen.tsx`, `components/participant/announcements/AnnouncementListItem.tsx`

**formatFileSize** (1 file):
`components/participant/chat/MessageBubble.tsx`

**cities** (4 files):
`api/queries/auth.queries.ts`, `components/signup/CityPicker.tsx`, `components/signup/ProfileForm.tsx`, `store/useProfileStore.ts`

**geolocation** (1 file):
`api/services/weather.service.ts`

Tip to find any you might have missed after editing: `grep -rn "lib/\(interpolate\|relativeTime\|phone\|initials\|formatFileSize\|cities\|geolocation\)'" src` should return **nothing**.

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0, no errors. (A "cannot find module '@/utils/...'" error means an importer still points at the old `lib/` path — fix it and re-run.)

- [ ] **Step 4: Format & commit**

```bash
git add -A
npx prettier --write --end-of-line auto $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$')
git add -A
git commit -m "refactor: move pure utils lib/ -> utils/ (@/ alias)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Move hooks to `src/hooks/` (incl. the push pair and `useMe`)

Create `src/hooks/` and move the two stray hooks, the push pair (`usePushNotifications` + its only consumer `pushClient`), and the misplaced `useMe` selector out of `store/`. Fix the moved files' own imports and their importers.

**Files:**
- Move: `src/lib/useSheetDrag.ts`, `src/lib/useTypewriter.ts` → `src/hooks/`
- Move: `src/lib/push/usePushNotifications.ts`, `src/lib/push/pushClient.ts` → `src/hooks/`
- Move: `src/store/useMe.ts` → `src/hooks/useMe.ts`
- Modify (own imports): `src/hooks/usePushNotifications.ts`, `src/hooks/useMe.ts`
- Modify (importers): `components/participant/sos/SosSheet.tsx`, `components/ui/Sheet.tsx`, `components/signup/ProfileForm.tsx`, `components/participant/profile/SettingsList.tsx`, `components/organizer/chat/OrgChatScreen.tsx`, `components/participant/chat/ChatScreen.tsx`
- Delete (empty dir): `src/lib/push/`

**Interfaces:**
- Consumes: the `@/` alias.
- Produces: `@/hooks/useSheetDrag`, `@/hooks/useTypewriter`, `@/hooks/usePushNotifications`, `@/hooks/useMe` (same exports as before). `pushClient` stays an internal sibling of `usePushNotifications` (imported as `./pushClient`, not exposed under a new public path).

- [ ] **Step 1: Create `hooks/` and move the 5 files**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
mkdir -p src/hooks
git mv src/lib/useSheetDrag.ts src/hooks/useSheetDrag.ts
git mv src/lib/useTypewriter.ts src/hooks/useTypewriter.ts
git mv src/lib/push/pushClient.ts src/hooks/pushClient.ts
git mv src/lib/push/usePushNotifications.ts src/hooks/usePushNotifications.ts
git mv src/store/useMe.ts src/hooks/useMe.ts
rmdir src/lib/push
```

`usePushNotifications` imports `./pushClient` — both land in `hooks/`, so that sibling import stays valid and needs no change.

- [ ] **Step 2: Fix `hooks/usePushNotifications.ts` own imports**

It currently has (lines ~10-11):

```ts
import { usePushStore } from '../../store/usePushStore'
import { useRegisterPush, useUnregisterPush } from '../../api/queries/push.queries'
```

Change those two relative paths (now wrong from `hooks/`) to the alias:

```ts
import { usePushStore } from '@/store/usePushStore'
import { useRegisterPush, useUnregisterPush } from '@/api/queries/push.queries'
```

Leave `import { useEffect } from 'react'` and `import { ... } from './pushClient'` unchanged.

- [ ] **Step 3: Fix `hooks/useMe.ts` own imports**

It currently has:

```ts
import { useProfileStore } from './useProfileStore'
import type { MeIdentity } from '../lib/chat'
```

Change both to the alias (keep the `import type`):

```ts
import { useProfileStore } from '@/store/useProfileStore'
import type { MeIdentity } from '@/lib/chat'
```

- [ ] **Step 4: Repoint the importers**

Edit each file's import specifier to the new `@/hooks/*` path:

- `components/participant/sos/SosSheet.tsx` — `useSheetDrag` → `'@/hooks/useSheetDrag'`
- `components/ui/Sheet.tsx` — `useSheetDrag` → `'@/hooks/useSheetDrag'`
- `components/signup/ProfileForm.tsx` — `useTypewriter` → `'@/hooks/useTypewriter'`
- `components/participant/profile/SettingsList.tsx` — `usePushNotifications` → `'@/hooks/usePushNotifications'`
- `components/organizer/chat/OrgChatScreen.tsx` — `useMe` → `'@/hooks/useMe'`
- `components/participant/chat/ChatScreen.tsx` — `useMe` → `'@/hooks/useMe'`

Verify none missed: `grep -rn "lib/\(useSheetDrag\|useTypewriter\|push/\)\|store/useMe'" src` should return **nothing**.

- [ ] **Step 5: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 6: Format & commit**

```bash
git add -A
npx prettier --write --end-of-line auto $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$')
git add -A
git commit -m "refactor: move hooks (+push pair, useMe) to hooks/ (@/ alias)

useMe was a selector hook living in store/; pushClient moves with its only
consumer usePushNotifications. store/ now holds only real Zustand stores.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Move `queryClient` to `src/api/`

The shared React Query client is infra and belongs with the api layer.

**Files:**
- Move: `src/lib/queryClient.ts` → `src/api/queryClient.ts`
- Modify (importers): `src/main.tsx`, `src/api/realtime/realtimeBridge.ts`

**Interfaces:**
- Consumes: the `@/` alias.
- Produces: `@/api/queryClient` (same `queryClient` export; only external `@tanstack/react-query` import inside, no internal imports to fix).

- [ ] **Step 1: Move the file**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
git mv src/lib/queryClient.ts src/api/queryClient.ts
```

- [ ] **Step 2: Repoint the 2 importers**

In `src/main.tsx` and `src/api/realtime/realtimeBridge.ts`, change the `queryClient` import specifier to `'@/api/queryClient'`.

Verify: `grep -rn "lib/queryClient'" src` returns **nothing**.

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 4: Format & commit**

```bash
git add -A
npx prettier --write --end-of-line auto src/api/queryClient.ts src/main.tsx src/api/realtime/realtimeBridge.ts
git add -A
git commit -m "refactor: move queryClient lib/ -> api/ (@/ alias)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Move the 6 alive mocks into `src/lib/mocks/`

Group the remaining (live) mock fixtures into a `mocks/` subfolder so `lib/` becomes self-documenting: `lib/*.ts` = contracts + `api.ts` awaiting migration, `lib/mocks/` = fixtures.

**Files:**
- Move: `src/lib/{mockAdminCamps,mockCamp,mockHelpRequests,mockOrgChat,mockChat,mockMembership}.ts` → `src/lib/mocks/`
- Modify (each moved mock's own type import): all 6 moved files
- Modify (external importers): `api/services/adminCamps.service.ts`, `api/services/helpRequests.service.ts`, `api/services/orgChat.service.ts`, `components/participant/sos/SosSheet.tsx`, `components/participant/sos/useSos.ts`
- Modify (in-`lib` sibling importers): `lib/chat.ts`, `lib/membership.ts`, `lib/campHome.ts`

**Interfaces:**
- Consumes: the `@/` alias.
- Produces: `@/lib/mocks/mockAdminCamps`, `@/lib/mocks/mockCamp`, `@/lib/mocks/mockHelpRequests`, `@/lib/mocks/mockOrgChat`, `@/lib/mocks/mockChat`, `@/lib/mocks/mockMembership` (same exports; only path changes).

- [ ] **Step 1: Create `lib/mocks/` and move the 6 files**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
mkdir -p src/lib/mocks
git mv src/lib/mockAdminCamps.ts src/lib/mocks/mockAdminCamps.ts
git mv src/lib/mockCamp.ts src/lib/mocks/mockCamp.ts
git mv src/lib/mockHelpRequests.ts src/lib/mocks/mockHelpRequests.ts
git mv src/lib/mockOrgChat.ts src/lib/mocks/mockOrgChat.ts
git mv src/lib/mockChat.ts src/lib/mocks/mockChat.ts
git mv src/lib/mockMembership.ts src/lib/mocks/mockMembership.ts
```

- [ ] **Step 2: Fix each moved mock's own type import**

Each moved mock imports a type via a relative path that is now wrong from `lib/mocks/`. Change each to the alias (all are `import type` — keep that):

- `src/lib/mocks/mockAdminCamps.ts`: `'../api/services/adminCamps.service'` → `'@/api/services/adminCamps.service'`
- `src/lib/mocks/mockHelpRequests.ts`: `'../api/services/helpRequests.service'` → `'@/api/services/helpRequests.service'`
- `src/lib/mocks/mockOrgChat.ts`: `'../api/services/orgChat.service'` → `'@/api/services/orgChat.service'`
- `src/lib/mocks/mockCamp.ts`: `'./campHome'` → `'@/lib/campHome'`
- `src/lib/mocks/mockChat.ts`: `'./chat'` → `'@/lib/chat'`
- `src/lib/mocks/mockMembership.ts`: `'./membership'` → `'@/lib/membership'`

- [ ] **Step 3: Repoint the external importers**

Change the mock import specifier to `@/lib/mocks/<name>` in each:

- `api/services/adminCamps.service.ts` — mockAdminCamps → `'@/lib/mocks/mockAdminCamps'`
- `api/services/helpRequests.service.ts` — mockHelpRequests → `'@/lib/mocks/mockHelpRequests'`
- `api/services/orgChat.service.ts` — mockOrgChat → `'@/lib/mocks/mockOrgChat'`
- `components/participant/sos/SosSheet.tsx` — mockCamp → `'@/lib/mocks/mockCamp'`
- `components/participant/sos/useSos.ts` — mockCamp → `'@/lib/mocks/mockCamp'`

- [ ] **Step 4: Repoint the 3 in-`lib` sibling importers**

These contract modules import a mock as a sibling `./mockX`; change to the alias:

- `lib/chat.ts` — `'./mockChat'` → `'@/lib/mocks/mockChat'`
- `lib/membership.ts` — `'./mockMembership'` → `'@/lib/mocks/mockMembership'`
- `lib/campHome.ts` — `'./mockCamp'` → `'@/lib/mocks/mockCamp'`

Verify none missed: `grep -rn "lib/mock\|'\./mock" src` should only show hits under `src/lib/mocks/` itself (there should be none referencing the old flat `lib/mockX` path).

- [ ] **Step 5: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0, no errors.

- [ ] **Step 6: Format & commit**

```bash
git add -A
npx prettier --write --end-of-line auto $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$')
git add -A
git commit -m "refactor: group live mock fixtures into lib/mocks/ (@/ alias)

lib/ is now self-documenting: contracts + api.ts at top level, fixtures in mocks/.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Update Frontend `CLAUDE.md`

Document the new layout so the guide matches the code (a same-change requirement of this repo).

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: the final folder layout from Tasks 1-6. Produces: docs only.

- [ ] **Step 1: Add the `@/` alias convention**

In `CLAUDE.md`, in the **"Stack notes"** section, replace the existing bullet:

```
- **No path aliases** — imports are relative.
```

with:

```
- **Path alias `@/` → `src/`** (tsconfig `paths` + Vite `resolve.alias`). New and
  moved code imports via `@/...` (e.g. `@/utils/interpolate`, `@/hooks/useMe`,
  `@/api/queryClient`). Adoption is **convert-as-you-touch** — untouched files may
  still use relative imports; convert a file's imports when you edit it, don't mass-rewrite.
```

- [ ] **Step 2: Add `utils/` and `hooks/` to the Architecture section**

In `CLAUDE.md`, immediately **before** the `### i18n` subsection under "Architecture", insert:

```markdown
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
```

- [ ] **Step 3: Update the `lib/` description (mock-era transitional zone)**

In `CLAUDE.md`, find the blockquote in the "Data layer — `src/lib/<domain>.ts`" subsection that begins "> This `lib/<domain>.ts` shape is the **mock-era** boundary." Replace that entire blockquote with:

```markdown
> `src/lib/` is now the shrunken **mock-era transitional zone** — only what hasn't
> migrated yet: the not-yet-migrated data-contract modules (`campHome`, `chat`,
> `leaderboard`, `membership`, `groups`), the old fetch wrapper `api.ts` (kept only
> because those modules' commented mock→real seam lines reference it — it goes when
> the last of them migrates), and `lib/mocks/` (the live fixtures behind the seam).
> As each endpoint lands, its `lib` module migrates into an `api/services` +
> `api/queries` pair. **Don't add new features to the `lib` shape** — new data
> features start in `api/`. Utilities went to `@/utils`, hooks to `@/hooks`,
> `queryClient` to `@/api/queryClient`.
```

- [ ] **Step 4: Update the `store/` description**

In `CLAUDE.md`, in the "Client state — Zustand stores" subsection, find the sentence describing the "me" overlay / `useMe` (currently "Source the current user from **`useMe()`** (`src/store/useMe.ts`)…") and change the path reference `src/store/useMe.ts` to `src/hooks/useMe.ts`. Add, at the end of that subsection's first paragraph: "`store/` holds **only** Zustand stores; selectors like `useMe` live in `@/hooks`."

- [ ] **Step 5: Verify the doc matches reality**

Run: `ls src/utils src/hooks src/lib src/api/queryClient.ts`
Expected: `utils/` lists the 7 helpers; `hooks/` lists `useSheetDrag`, `useTypewriter`, `useMe`, `usePushNotifications`, `pushClient`; `lib/` lists `api.ts` + 5 contracts + `mocks/`; `api/queryClient.ts` exists. Confirm the CLAUDE.md text names match.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update frontend CLAUDE.md for utils/hooks/@ alias + lib reshape

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Final full verification

Confirm the whole refactor is green end-to-end — lint, format, types, production build, and a manual smoke of all three surfaces.

**Files:** none (verification only).

- [ ] **Step 1: Full validate (lint + format:check + typecheck)**

Run: `npm run validate`
Expected: all three pass, exit 0. (This is the pre-commit gate; it should already be green from per-task commits.)

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds, no unresolved-import errors.

- [ ] **Step 3: Dev smoke of all three surfaces**

Run: `npm run dev`, then in a browser confirm each loads without a blank screen or console import error:
- Participant: `http://localhost:5173/` (login landing) and, after entering, `/camp/home`.
- Organizer: `/org/welcome` (or `/org` if a session exists).
- Organization: `/admin/login`.

Expected: each surface renders. Stop the dev server when done.

- [ ] **Step 4: Confirm the tree is clean**

Run: `git status`
Expected: working tree clean, all work committed on `chore/frontend-structure-cleanup`.

- [ ] **Step 5 (optional): Open a PR to `dev`**

Only if the user asks. `gh pr create --base dev --title "Frontend structure cleanup" --body "..."`.

---

## Notes for the implementer

- **If any `typecheck` fails after a move**, the cause is almost always an importer still pointing at the old path, or a moved file's own relative import not repointed. The error message names the file and the missing module — fix that specifier and re-run. Do not proceed to the next task on a red build.
- **Order matters.** Task 1 (alias) must land first; Tasks 2-6 are otherwise independent but are ordered to keep diffs small. Task 7 (docs) must come last so it describes the final state.
- **Never** touch the Backend repo or the four live files listed in Global Constraints.
