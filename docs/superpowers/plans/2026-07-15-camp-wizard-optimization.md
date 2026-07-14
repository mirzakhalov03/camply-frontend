# Camp Wizard Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the camp-creation wizard into a refresh-safe, collect-then-commit flow (one backend write on Finish) with a location dropdown, a redesigned progress stepper, placeholders, and required-field asterisks.

**Architecture:** A persisted Zustand store (`useCampDraftStore`) holds the entire uncommitted wizard (info + groups + participants + a commit ledger). Every step reads/writes the store instead of hitting the API as you go. On Finish, a single resumable orchestrator (`useCommitCampDraft`) runs `create camp → groups → participants → publish` against the existing per-entity endpoints, skipping any work the ledger records as already done.

**Tech Stack:** React 19 (JSX runtime, no `import React`), TypeScript strict, Zustand + `persist` middleware, TanStack Query, Tailwind v4 (CSS-first tokens), trilingual i18n (`translations.ts`).

## Global Constraints

- **No test runner** — project preference. Do NOT add or suggest tests. Verification per task is `npm run validate` (oxlint + prettier check + `tsc -b --noEmit`) plus the described runtime check.
- **Run `npm run validate` from the Frontend repo root** (`/Users/mn.afridi/Desktop/Camply/Frontend`) before every commit; it is the pre-commit hook and a commit fails unless it passes.
- **Prettier:** no semicolons, single quotes (double only when the string contains a `'`), trailing commas, width 100. Format only touched files, preserving endings: `npx prettier --write --end-of-line auto <files>`.
- **TypeScript:** `noUnusedLocals`/`noUnusedParameters` on; `verbatimModuleSyntax` on — use `import type { … }` for type-only imports.
- **Design tokens only** — no raw hex. Use `bg-pine`, `bg-line`, `text-muted`, `text-content`, `text-danger`, `rounded-input`, `text-meta`/`text-caption`/`text-heading`, etc. (Mirroring an existing primitive's arbitrary shadow/`var(--color-focus)` recipe verbatim is allowed — `Field` already uses it.)
- **Trilingual, non-negotiable** — every new string ships UZ + RU + EN in `translations.ts`, typed so the compiler forces coverage. Place names (`Bo'stonliq`, `Renesans`) are proper nouns — NOT translated.
- **Data rules** — components call query hooks only (never services/axios directly), EXCEPT the commit orchestrator hook itself, which composes the existing services. Server data stays in React Query; the uncommitted draft is client-owned form state and lives in Zustand.
- **Branch:** work on `fix/org-bugs` (already checked out).
- **Commit message trailer:** end each commit body with
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## File Structure

**New**
- `src/lib/campLocations.ts` — `CAMP_LOCATIONS` constant (the org's two sites).
- `src/components/ui/Select.tsx` — styled native `<select>` primitive.
- `src/store/useCampDraftStore.ts` — persisted wizard draft + commit ledger.
- `src/api/queries/campDraft.queries.ts` — `useCommitCampDraft` orchestrator.

**Modified**
- `src/components/ui/index.ts` — export `Select`.
- `src/i18n/translations.ts` — new `campWizard` keys ×3 languages.
- `src/components/camp-wizard/Stepper.tsx` — redesigned progress indicator.
- `src/components/camp-wizard/wizardTypes.ts` — drop `WizardDraft`.
- `src/components/camp-wizard/CampWizard.tsx` — store-driven, commit on Finish.
- `src/components/camp-wizard/steps/InfoStep.tsx` — store-bound + dropdown/row/placeholders/asterisks.
- `src/components/camp-wizard/steps/GroupsStep.tsx` — store-bound, no API.
- `src/components/camp-wizard/steps/ParticipantsStep.tsx` — store-bound, client dup check.
- `src/components/camp-wizard/steps/ReviewStep.tsx` — render from store.
- `src/components/camp-wizard/steps/OrganizersStep.tsx` — required-field asterisks.
- `../CLAUDE.md` (frontend `CLAUDE.md`) — store list + wizard note.

---

## Task 1: Location constant + `Select` primitive

**Files:**
- Create: `src/lib/campLocations.ts`
- Create: `src/components/ui/Select.tsx`
- Modify: `src/components/ui/index.ts`

**Interfaces:**
- Produces: `CAMP_LOCATIONS: readonly string[]`; `Select` component with props `{ options: { value: string; label: string }[]; placeholder?: string } & SelectHTMLAttributes<HTMLSelectElement>`.

- [ ] **Step 1: Create the locations constant**

`src/lib/campLocations.ts`:

```ts
/*
  The organization's camp sites. Proper nouns — literal in every language (same
  call as lib/groups.ts / lib/cities.ts), never routed through i18n. The camp
  wizard's location field is constrained to these.
*/
export const CAMP_LOCATIONS = ["Bo'stonliq", 'Renesans'] as const
```

- [ ] **Step 2: Create the `Select` primitive**

`src/components/ui/Select.tsx`:

```tsx
import type { SelectHTMLAttributes } from 'react'

/*
  The one dropdown. Mirrors Field's look — soft raised surface, 16px radius, pine
  focus ring — for a native <select> (best mobile UX: the OS picker, a11y for free,
  no dependency). Shows `placeholder` as a disabled first option and dims the
  control until a real value is chosen, matching Field's placeholder color.
*/
type Option = { value: string; label: string }
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[]
  placeholder?: string
}

export function Select({ options, placeholder, className = '', value, ...rest }: Props) {
  return (
    <select
      value={value}
      className={`h-[52px] w-full rounded-input border-[1.5px] border-line bg-surface-2 px-[15px] text-title font-semibold text-content shadow-[0_3px_10px_rgba(20,40,30,0.04)] outline-none transition-colors focus:border-pine focus:bg-surface focus:shadow-[0_0_0_4px_var(--color-focus)] ${value ? '' : 'text-muted'} ${className}`}
      {...rest}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-content">
          {o.label}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 3: Export `Select` from the barrel**

In `src/components/ui/index.ts`, add after the `Field` export:

```ts
export { Select } from './Select'
```

- [ ] **Step 4: Validate**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run validate`
Expected: PASS (lint, format check, typecheck all green).

- [ ] **Step 5: Commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npx prettier --write --end-of-line auto src/lib/campLocations.ts src/components/ui/Select.tsx src/components/ui/index.ts
git add src/lib/campLocations.ts src/components/ui/Select.tsx src/components/ui/index.ts
git commit -m "feat(ui): add Select primitive and CAMP_LOCATIONS constant

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: i18n keys

**Files:**
- Modify: `src/i18n/translations.ts` (type `CampWizardStrings` ~line 574; `uz` block ~line 1127; `ru` and `en` `campWizard` blocks ~lines 1650, 2174)

**Interfaces:**
- Produces: `t.campWizard.{stepProgress, namePlaceholder, capacityPlaceholder, locationPlaceholder, commitError, retry, creating}` in all three languages.

- [ ] **Step 1: Extend the `CampWizardStrings` type**

In `type CampWizardStrings = { … }` (after `orgEmail: string`), add:

```ts
  stepProgress: string // 'Step {n} of {total}'
  namePlaceholder: string
  capacityPlaceholder: string
  locationPlaceholder: string
  commitError: string
  retry: string
  creating: string
```

- [ ] **Step 2: Add the UZ strings**

In the `uz` `campWizard` block (after `orgEmail: 'Email',`):

```ts
      stepProgress: 'Qadam {n} / {total}',
      namePlaceholder: 'masalan, Boʻstonliq 2026',
      capacityPlaceholder: 'masalan, 40',
      locationPlaceholder: 'Manzilni tanlang',
      commitError: 'Lagerni yaratib boʻlmadi. Qayta urinib koʻring.',
      retry: 'Qayta urinish',
      creating: 'Yaratilmoqda…',
```

- [ ] **Step 3: Add the RU strings**

In the `ru` `campWizard` block (after `orgEmail: …,`):

```ts
      stepProgress: 'Шаг {n} из {total}',
      namePlaceholder: 'напр., Бустанлык 2026',
      capacityPlaceholder: 'напр., 40',
      locationPlaceholder: 'Выберите локацию',
      commitError: 'Не удалось создать лагерь. Попробуйте ещё раз.',
      retry: 'Повторить',
      creating: 'Создание…',
```

- [ ] **Step 4: Add the EN strings**

In the `en` `campWizard` block (after `orgEmail: …,`):

```ts
      stepProgress: 'Step {n} of {total}',
      namePlaceholder: "e.g. Bo'stonliq Summer 2026",
      capacityPlaceholder: 'e.g. 40',
      locationPlaceholder: 'Select location',
      commitError: 'Could not create the camp. Please try again.',
      retry: 'Try again',
      creating: 'Creating…',
```

- [ ] **Step 5: Validate**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run validate`
Expected: PASS. (If typecheck complains a language is missing a key, add it — the type forces full coverage.)

- [ ] **Step 6: Commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npx prettier --write --end-of-line auto src/i18n/translations.ts
git add src/i18n/translations.ts
git commit -m "i18n(campWizard): add stepper, placeholder, and commit strings

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: `useCampDraftStore` (persisted draft)

**Files:**
- Create: `src/store/useCampDraftStore.ts`

**Interfaces:**
- Produces:
  - `DraftGroup = { tempId: string; name: string; color: string }`
  - `DraftParticipant = { tempId: string; phone: string; groupTempId: string }`
  - `CampDraftInfo = { name: string; location: string; starts: string; ends: string; capacity: string }`
  - `useCampDraftStore` with state `{ info, groups, participants, progress }` and actions `patchInfo, addGroup, removeGroup, addParticipant, removeParticipant, setCampId, mapGroupId, markParticipantAdded, markPublished, reset`.
  - `progress = { campId: string | null; groupIdMap: Record<string, string>; addedParticipantTempIds: string[]; published: boolean }`

- [ ] **Step 1: Create the store**

`src/store/useCampDraftStore.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CAMP_GROUPS } from '../lib/groups'

/*
  The uncommitted camp-creation draft. This is CLIENT-OWNED form state (nothing is
  on the server until the wizard's Finish), so it lives in Zustand, not React Query.
  `persist` → localStorage makes the whole wizard survive a refresh / PWA relaunch.

  `progress` is the COMMIT LEDGER: the real campId once created, a tempId→realId map
  for groups, and the tempIds of participants already POSTed. useCommitCampDraft
  consults it so a retry after a mid-way failure skips finished work (no duplicates).
*/
export type DraftGroup = { tempId: string; name: string; color: string }
export type DraftParticipant = { tempId: string; phone: string; groupTempId: string }
export type CampDraftInfo = {
  name: string
  location: string
  starts: string // YYYY-MM-DD
  ends: string
  capacity: string
}

type Progress = {
  campId: string | null
  groupIdMap: Record<string, string>
  addedParticipantTempIds: string[]
  published: boolean
}

type CampDraftState = {
  info: CampDraftInfo
  groups: DraftGroup[]
  participants: DraftParticipant[]
  progress: Progress
  patchInfo: (patch: Partial<CampDraftInfo>) => void
  addGroup: (name: string) => void
  removeGroup: (tempId: string) => void
  addParticipant: (phone: string, groupTempId: string) => void
  removeParticipant: (tempId: string) => void
  setCampId: (id: string) => void
  mapGroupId: (tempId: string, realId: string) => void
  markParticipantAdded: (tempId: string) => void
  markPublished: () => void
  reset: () => void
}

const EMPTY_INFO: CampDraftInfo = { name: '', location: '', starts: '', ends: '', capacity: '' }
const EMPTY_PROGRESS: Progress = {
  campId: null,
  groupIdMap: {},
  addedParticipantTempIds: [],
  published: false,
}

export const useCampDraftStore = create<CampDraftState>()(
  persist(
    (set) => ({
      info: EMPTY_INFO,
      groups: [],
      participants: [],
      progress: EMPTY_PROGRESS,
      patchInfo: (patch) => set((s) => ({ info: { ...s.info, ...patch } })),
      addGroup: (name) =>
        set((s) => {
          const color = CAMP_GROUPS[s.groups.length % CAMP_GROUPS.length].color
          return { groups: [...s.groups, { tempId: crypto.randomUUID(), name, color }] }
        }),
      removeGroup: (tempId) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.tempId !== tempId),
          participants: s.participants.filter((p) => p.groupTempId !== tempId),
        })),
      addParticipant: (phone, groupTempId) =>
        set((s) => ({
          participants: [
            ...s.participants,
            { tempId: crypto.randomUUID(), phone, groupTempId },
          ],
        })),
      removeParticipant: (tempId) =>
        set((s) => ({ participants: s.participants.filter((p) => p.tempId !== tempId) })),
      setCampId: (id) => set((s) => ({ progress: { ...s.progress, campId: id } })),
      mapGroupId: (tempId, realId) =>
        set((s) => ({
          progress: { ...s.progress, groupIdMap: { ...s.progress.groupIdMap, [tempId]: realId } },
        })),
      markParticipantAdded: (tempId) =>
        set((s) => ({
          progress: {
            ...s.progress,
            addedParticipantTempIds: [...s.progress.addedParticipantTempIds, tempId],
          },
        })),
      markPublished: () => set((s) => ({ progress: { ...s.progress, published: true } })),
      reset: () =>
        set({ info: EMPTY_INFO, groups: [], participants: [], progress: EMPTY_PROGRESS }),
    }),
    { name: 'camply-camp-draft' },
  ),
)
```

- [ ] **Step 2: Validate**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run validate`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npx prettier --write --end-of-line auto src/store/useCampDraftStore.ts
git add src/store/useCampDraftStore.ts
git commit -m "feat(store): add persisted useCampDraftStore for the camp wizard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: `useCommitCampDraft` orchestrator

**Files:**
- Create: `src/api/queries/campDraft.queries.ts`

**Interfaces:**
- Consumes: `useCampDraftStore` (Task 3); `campsService.create/publish`, `campGroupsService.create`, `rosterService.add` (existing); `organizerKeys` (existing).
- Produces: `useCommitCampDraft()` → a TanStack `useMutation` whose `mutateAsync()` takes no argument and resolves to the real `campId: string`.

- [ ] **Step 1: Create the orchestrator hook**

`src/api/queries/campDraft.queries.ts`:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { campsService } from '../services/camps.service'
import { campGroupsService } from '../services/campGroups.service'
import { rosterService } from '../services/roster.service'
import { organizerKeys } from '../queryKeys'
import { useCampDraftStore } from '../../store/useCampDraftStore'

/*
  Commits the in-memory camp draft on the wizard's Finish. The backend has no batch
  endpoint, so this orchestrates the per-entity sequence create camp → groups →
  participants → publish. It is RESUMABLE: each stage reads the draft's progress
  ledger and skips work that already succeeded, so a retry after a mid-way network
  failure never duplicates. Reads store state via getState() so it always sees the
  latest ledger it just wrote. On success it invalidates the organizer camp lists
  and clears the draft.
*/
export function useCommitCampDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const s = () => useCampDraftStore.getState()

      // 1. Create the draft camp if it doesn't exist yet.
      let campId = s().progress.campId
      if (!campId) {
        const info = s().info
        const cap = info.capacity.trim() ? Number(info.capacity) : undefined
        const camp = await campsService.create({
          name: info.name.trim(),
          location: info.location.trim(),
          startsAt: new Date(info.starts).toISOString(),
          endsAt: new Date(info.ends).toISOString(),
          ...(cap !== undefined && Number.isFinite(cap) && cap > 0 ? { capacity: cap } : {}),
        })
        campId = camp.id
        s().setCampId(campId)
      }

      // 2. Create each group not already mapped to a real id.
      for (const g of s().groups) {
        if (s().progress.groupIdMap[g.tempId]) continue
        const created = await campGroupsService.create(campId, { name: g.name, color: g.color })
        s().mapGroupId(g.tempId, created.id)
      }

      // 3. Add each participant not already added, into its group's real id.
      for (const p of s().participants) {
        if (s().progress.addedParticipantTempIds.includes(p.tempId)) continue
        const groupId = s().progress.groupIdMap[p.groupTempId] ?? null
        await rosterService.add(campId, { phone: p.phone, groupId })
        s().markParticipantAdded(p.tempId)
      }

      // 4. Publish, unless a prior attempt already did.
      if (!s().progress.published) {
        await campsService.publish(campId)
        s().markPublished()
      }

      return campId
    },
    onSuccess: (campId) => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
      queryClient.invalidateQueries({ queryKey: organizerKeys.camp(campId) })
      useCampDraftStore.getState().reset()
    },
  })
}
```

- [ ] **Step 2: Validate**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run validate`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npx prettier --write --end-of-line auto src/api/queries/campDraft.queries.ts
git add src/api/queries/campDraft.queries.ts
git commit -m "feat(api): add resumable useCommitCampDraft orchestrator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Stepper redesign

**Files:**
- Modify: `src/components/camp-wizard/Stepper.tsx` (full replace)

**Interfaces:**
- Consumes: `t.campWizard.stepProgress` (Task 2); `interpolate` (existing).
- Produces: unchanged component props `{ steps: WizardStepKey[]; current: WizardStepKey; onJump: (key: WizardStepKey) => void }` — so no caller changes.

- [ ] **Step 1: Replace `Stepper.tsx`**

```tsx
import { useTranslation } from '../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import type { WizardStepKey } from './wizardTypes'

const LABEL_KEY: Record<
  WizardStepKey,
  'stepInfo' | 'stepGroups' | 'stepOrganizers' | 'stepParticipants' | 'stepReview'
> = {
  info: 'stepInfo',
  groups: 'stepGroups',
  organizers: 'stepOrganizers',
  participants: 'stepParticipants',
  review: 'stepReview',
}

export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: WizardStepKey[]
  current: WizardStepKey
  onJump: (key: WizardStepKey) => void
}) {
  const { t } = useTranslation()
  const w = t.campWizard
  const currentIdx = steps.indexOf(current)

  return (
    <div className="px-5 pb-1 pt-3 md:px-8">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="truncate text-heading font-bold text-content">
          {w[LABEL_KEY[current]]}
        </span>
        <span className="flex-none text-meta font-semibold text-muted">
          {interpolate(w.stepProgress, { n: currentIdx + 1, total: steps.length })}
        </span>
      </div>
      <div className="flex gap-1.5">
        {steps.map((key, i) => {
          const done = i <= currentIdx
          const reachable = i <= currentIdx
          return (
            <button
              key={key}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(key)}
              aria-label={w[LABEL_KEY[key]]}
              className={`h-1.5 flex-1 rounded-full transition-colors disabled:cursor-default ${
                done ? 'bg-pine' : 'bg-line'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Validate**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run validate`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npx prettier --write --end-of-line auto src/components/camp-wizard/Stepper.tsx
git add src/components/camp-wizard/Stepper.tsx
git commit -m "feat(camp-wizard): redesign progress stepper as segmented bar

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Convert the wizard to store-driven deferred commit

This is the atomic architecture change: `CampWizard` and the four deferred steps
must change together to compile. Includes the InfoStep UX polish (dropdown, row,
placeholders, asterisks) so InfoStep is written once in final form.

**Files:**
- Modify: `src/components/camp-wizard/wizardTypes.ts`
- Modify: `src/components/camp-wizard/CampWizard.tsx` (full replace)
- Modify: `src/components/camp-wizard/steps/InfoStep.tsx` (full replace)
- Modify: `src/components/camp-wizard/steps/GroupsStep.tsx` (full replace)
- Modify: `src/components/camp-wizard/steps/ParticipantsStep.tsx` (full replace)
- Modify: `src/components/camp-wizard/steps/ReviewStep.tsx` (full replace)

**Interfaces:**
- Consumes: `useCampDraftStore` (Task 3), `useCommitCampDraft` (Task 4), `Select` + `CAMP_LOCATIONS` (Task 1), `t.campWizard.*` (Task 2).
- Produces: `InfoStep` now takes `{ error: string | null }`; `GroupsStep`/`ParticipantsStep`/`ReviewStep` take **no props**; `CampWizardProps` unchanged (`{ steps, onDone, onCancel }`), so `AdminNewCampScreen` / `NewCampScreen` need no edits.

- [ ] **Step 1: Trim `wizardTypes.ts`**

Replace the file with (drop `WizardDraft`):

```ts
/*
  Shared contracts for the reusable camp-creation wizard. Surface-agnostic: the org
  passes all five step keys, the organizer passes four (no 'organizers' — organizers
  cannot mint organizers, POST /organizers is org-only). The wizard collects the
  whole draft in useCampDraftStore and commits it once, on Finish.
*/
export type WizardStepKey = 'info' | 'groups' | 'organizers' | 'participants' | 'review'

export type CampWizardProps = {
  /** Ordered steps for THIS surface. Org: all 5. Organizer: omit 'organizers'. */
  steps: WizardStepKey[]
  /** Called after the camp is committed + published, with the real camp id. */
  onDone: (campId: string) => void
  /** Called when the user backs out of step 1 (draft is reset). */
  onCancel: () => void
}
```

- [ ] **Step 2: Replace `InfoStep.tsx`**

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { Field, Select } from '../../ui'
import { CAMP_LOCATIONS } from '../../../lib/campLocations'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

const REQ = <span className="text-danger"> *</span>

export function InfoStep({ error }: { error: string | null }) {
  const { t } = useTranslation()
  const c = t.createCamp
  const w = t.campWizard
  const info = useCampDraftStore((s) => s.info)
  const patchInfo = useCampDraftStore((s) => s.patchInfo)

  const locationOptions = CAMP_LOCATIONS.map((l) => ({ value: l, label: l }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">
          {c.name}
          {REQ}
        </label>
        <Field
          value={info.name}
          onChange={(e) => patchInfo({ name: e.target.value })}
          placeholder={w.namePlaceholder}
          autoComplete="off"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {c.starts}
            {REQ}
          </label>
          <Field
            type="date"
            value={info.starts}
            onChange={(e) => patchInfo({ starts: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {c.ends}
            {REQ}
          </label>
          <Field
            type="date"
            value={info.ends}
            min={info.starts}
            onChange={(e) => patchInfo({ ends: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {c.location}
            {REQ}
          </label>
          <Select
            value={info.location}
            onChange={(e) => patchInfo({ location: e.target.value })}
            options={locationOptions}
            placeholder={w.locationPlaceholder}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.capacity}</label>
          <Field
            type="number"
            inputMode="numeric"
            min={1}
            value={info.capacity}
            onChange={(e) => patchInfo({ capacity: e.target.value })}
            placeholder={w.capacityPlaceholder}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-caption font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Replace `GroupsStep.tsx`**

```tsx
import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

export function GroupsStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const groups = useCampDraftStore((s) => s.groups)
  const addGroup = useCampDraftStore((s) => s.addGroup)
  const removeGroup = useCampDraftStore((s) => s.removeGroup)
  const [name, setName] = useState('')

  const add = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addGroup(trimmed)
    setName('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.groupsTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.groupsHint}</p>
      </div>

      <div className="flex flex-col gap-2">
        {groups.map((g) => (
          <div
            key={g.tempId}
            className="flex items-center gap-3 rounded-input border border-line bg-surface px-3 py-2.5"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-green-tint text-body">
              🏕
            </span>
            <span className="flex-1 truncate text-body font-semibold text-content">{g.name}</span>
            <button
              type="button"
              aria-label={w.remove}
              onClick={() => removeGroup(g.tempId)}
              className="flex-none px-2 text-subhead text-muted active:scale-90"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-input border border-dashed border-line bg-soft px-3 py-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={w.groupNamePlaceholder}
          className="min-w-0 flex-1 bg-transparent py-2 text-body text-content outline-none"
        />
        <button
          type="button"
          onClick={add}
          disabled={!name.trim()}
          className="flex-none rounded-input bg-pine px-3.5 py-2 text-caption font-bold text-white disabled:opacity-50 active:scale-95"
        >
          {w.addGroup}
        </button>
      </div>

      <p className="rounded-input bg-soft px-3.5 py-2.5 text-caption text-muted">
        {interpolate(w.groupCount, { count: groups.length })}
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Replace `ParticipantsStep.tsx`**

```tsx
import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { PhoneInput } from '../../auth/PhoneInput'
import { PHONE_LENGTH } from '@/utils/phone'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

export function ParticipantsStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const a = t.addParticipant
  const groups = useCampDraftStore((s) => s.groups)
  const participants = useCampDraftStore((s) => s.participants)
  const addParticipant = useCampDraftStore((s) => s.addParticipant)

  const [groupTempId, setGroupTempId] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const activeGroup = groupTempId ?? groups[0]?.tempId ?? null
  const members = participants.filter((p) => p.groupTempId === activeGroup)
  const valid = phone.length === PHONE_LENGTH

  const submit = () => {
    if (!valid || !activeGroup) return
    if (participants.some((p) => p.phone === phone)) {
      setError(a.duplicate)
      return
    }
    addParticipant(phone, activeGroup)
    setPhone('')
    setError(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.participantsTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.participantsHint}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => {
          const on = g.tempId === activeGroup
          return (
            <button
              key={g.tempId}
              type="button"
              onClick={() => setGroupTempId(g.tempId)}
              className={`flex-none rounded-full border px-4 py-2 text-caption font-semibold ${
                on ? 'border-pine bg-green-tint text-pine' : 'border-line bg-surface text-muted'
              }`}
            >
              {g.name}
            </button>
          )
        })}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <PhoneInput
            value={phone}
            onChange={(d) => {
              setPhone(d)
              if (error) setError(null)
            }}
            label={a.phone}
            error={t.login.phoneError}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!valid || !activeGroup}
          className="mb-0.5 flex-none rounded-input bg-pine px-4 py-3 text-caption font-bold text-white disabled:opacity-50 active:scale-95"
        >
          {w.addGroup}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-caption font-semibold text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {members.map((p) => (
          <div
            key={p.tempId}
            className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-body text-content">{p.phone}</div>
              <div className="text-meta text-muted">{w.pending}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Replace `ReviewStep.tsx`**

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

function formatRange(starts: string, ends: string): string {
  if (!starts || !ends) return ''
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(starts)} – ${fmt(ends)}`
}

export function ReviewStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const info = useCampDraftStore((s) => s.info)
  const groups = useCampDraftStore((s) => s.groups)
  const participants = useCampDraftStore((s) => s.participants)

  const stats = [
    { label: w.statGroups, value: groups.length },
    { label: w.statParticipants, value: participants.length },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-title font-bold text-content">{w.reviewTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.reviewHint}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        <div className="text-heading font-bold text-content">{info.name}</div>
        <div className="flex flex-col gap-1.5 text-caption text-content">
          <div>📅 {formatRange(info.starts, info.ends)}</div>
          <div>📍 {info.location}</div>
        </div>
        <div className="flex gap-2 border-t border-line pt-3">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <div className="text-display font-extrabold text-pine">{s.value}</div>
              <div className="text-meta font-semibold text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {groups.map((g) => {
          const count = participants.filter((p) => p.groupTempId === g.tempId).length
          return (
            <div
              key={g.tempId}
              className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-3"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-input bg-green-tint">
                🏕
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-body font-bold text-content">{g.name}</div>
                <div className="text-meta text-muted">{count}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Replace `CampWizard.tsx`**

```tsx
import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { Stepper } from './Stepper'
import { InfoStep } from './steps/InfoStep'
import { GroupsStep } from './steps/GroupsStep'
import { OrganizersStep } from './steps/OrganizersStep'
import { ParticipantsStep } from './steps/ParticipantsStep'
import { ReviewStep } from './steps/ReviewStep'
import { useCommitCampDraft } from '../../api/queries/campDraft.queries'
import { useCampDraftStore } from '../../store/useCampDraftStore'
import type { CampWizardProps, WizardStepKey } from './wizardTypes'

export function CampWizard({ steps, onDone, onCancel }: CampWizardProps) {
  const { t } = useTranslation()
  const w = t.campWizard
  const c = t.createCamp
  const [idx, setIdx] = useState(0)
  const [infoError, setInfoError] = useState<string | null>(null)
  const commit = useCommitCampDraft()
  const reset = useCampDraftStore((s) => s.reset)

  const current = steps[idx]
  const isFirst = idx === 0
  const isLast = idx === steps.length - 1

  // Pure validation gate for step 1 — no network here anymore.
  const validateInfo = (): boolean => {
    const { name, location, starts, ends } = useCampDraftStore.getState().info
    if (!name.trim() || !location.trim() || !starts || !ends) {
      setInfoError(c.required)
      return false
    }
    if (ends < starts) {
      setInfoError(c.dateError)
      return false
    }
    setInfoError(null)
    return true
  }

  const goNext = async () => {
    if (commit.isPending) return
    if (current === 'info' && !validateInfo()) return
    if (isLast) {
      // The one and only backend write. Resumable: a retry skips finished work.
      const campId = await commit.mutateAsync().catch(() => null)
      if (campId) onDone(campId)
      return
    }
    setIdx((i) => i + 1)
  }

  const goBack = () => {
    if (isFirst) {
      reset()
      onCancel()
      return
    }
    setIdx((i) => i - 1)
  }

  const jump = (key: WizardStepKey) => {
    const target = steps.indexOf(key)
    if (target <= idx) setIdx(target)
  }

  const finishLabel = commit.isPending ? w.creating : commit.isError ? w.retry : w.finish

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <header className="flex items-center gap-3 px-5 pt-4 md:px-8">
        <button
          type="button"
          onClick={goBack}
          aria-label={w.back}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-input border border-line bg-surface text-content active:scale-95"
        >
          ‹
        </button>
        <h1 className="text-subhead font-bold text-content">{w.title}</h1>
      </header>

      <Stepper steps={steps} current={current} onJump={jump} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-3 md:px-8">
        {current === 'info' && <InfoStep error={infoError} />}
        {current === 'groups' && <GroupsStep />}
        {current === 'organizers' && <OrganizersStep />}
        {current === 'participants' && <ParticipantsStep />}
        {current === 'review' && <ReviewStep />}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-5 pb-6 pt-4 md:px-8">
        {isLast && commit.isError && (
          <p role="alert" className="text-caption font-semibold text-danger">
            {commit.error instanceof Error ? commit.error.message : w.commitError}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-none rounded-full border border-line bg-surface px-5 py-3.5 text-body font-semibold text-content active:scale-95"
          >
            {isFirst ? t.notfound.back : w.back}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={commit.isPending}
            className="flex-1 rounded-full bg-pine py-3.5 text-body font-bold text-white shadow-[0_8px_18px_rgba(15,107,79,0.28)] disabled:opacity-60 active:scale-95"
          >
            {isLast ? finishLabel : w.next}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Validate**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run validate`
Expected: PASS. (Watch for a leftover unused import — e.g. old `usePublishCamp` — and remove it if flagged.)

- [ ] **Step 8: Runtime check (the core behavior)**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run dev`, open the org surface, go to **New camp**:
1. Fill Info (name, dates, pick a location from the dropdown, optional capacity) → Continue.
2. Add 2 groups; add a participant into a group.
3. **Refresh the page** → the wizard restores name/groups/participants (draft survived).
4. Open DevTools → Network: confirm **no** `POST /organizer/camps*` calls happened during steps 1–2.
5. On Review, press **Finish** → observe the ordered calls: `POST …/camps`, then `POST …/groups`×2, then `POST …/roster`, then `POST …/publish`; land on the camp detail. `localStorage` key `camply-camp-draft` is cleared.

Expected: all of the above. If the backend `/organizer/camps` endpoints aren't live in this environment, verify steps 1–4 (persistence + no early writes) and that Finish fires the sequence + surfaces the retry state on failure.

- [ ] **Step 9: Commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npx prettier --write --end-of-line auto src/components/camp-wizard/wizardTypes.ts src/components/camp-wizard/CampWizard.tsx src/components/camp-wizard/steps/InfoStep.tsx src/components/camp-wizard/steps/GroupsStep.tsx src/components/camp-wizard/steps/ParticipantsStep.tsx src/components/camp-wizard/steps/ReviewStep.tsx
git add src/components/camp-wizard
git commit -m "feat(camp-wizard): defer all writes to a single resumable commit on Finish

Draft lives in useCampDraftStore (persisted, survives refresh); steps collect
in-memory and the wizard commits create→groups→participants→publish once.
InfoStep gains the location dropdown, location+capacity row, placeholders, and
required-field asterisks.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: OrganizersStep required asterisks

**Files:**
- Modify: `src/components/camp-wizard/steps/OrganizersStep.tsx` (the three `Field` placeholders + the `PhoneInput` label)

**Interfaces:**
- Consumes: existing `w.orgName/orgSurname/orgEmail`, `t.addParticipant.phone`. No new i18n.

- [ ] **Step 1: Append a required marker to each required field**

In `OrganizersStep.tsx`, change the three name/surname/email `Field` placeholders and the phone label to append ` *`:

```tsx
        <div className="flex gap-3">
          <Field
            placeholder={`${w.orgName} *`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            placeholder={`${w.orgSurname} *`}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <Field
          type="email"
          placeholder={`${w.orgEmail} *`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />
        <PhoneInput
          value={phone}
          onChange={setPhone}
          label={`${t.addParticipant.phone} *`}
          error={t.login.phoneError}
        />
```

(These fields are label-less placeholders, so the marker lives in the placeholder/label text — consistent with the asterisk convention without needing new labels.)

- [ ] **Step 2: Validate**

Run: `cd /Users/mn.afridi/Desktop/Camply/Frontend && npm run validate`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npx prettier --write --end-of-line auto src/components/camp-wizard/steps/OrganizersStep.tsx
git add src/components/camp-wizard/steps/OrganizersStep.tsx
git commit -m "feat(camp-wizard): mark required fields on the organizers step

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Update frontend CLAUDE.md

**Files:**
- Modify: `../CLAUDE.md` (frontend `CLAUDE.md`, from the Frontend repo root)

- [ ] **Step 1: Add the store to the Zustand list**

In the "Client state — Zustand stores" section, add `useCampDraftStore` to the store enumeration with a one-liner, e.g. after `useGroupStore`:

```
`useCampDraftStore` (the camp-creation wizard's uncommitted draft — info + groups +
participants + a commit ledger; `persist`ed so the wizard survives refresh),
```

- [ ] **Step 2: Revise the camp-wizard mental model**

Find any note describing the wizard as "draft-first" (InfoStep POSTs a draft immediately) and replace it with the collect-then-commit model: the wizard collects the whole draft in `useCampDraftStore` and commits once on Finish via `useCommitCampDraft` (resumable `create → groups → participants → publish`); organizer invites remain immediate. If no such note exists, add one sentence to the camps/wizard area.

- [ ] **Step 3: Validate + commit**

```bash
cd /Users/mn.afridi/Desktop/Camply/Frontend
npm run validate
git add CLAUDE.md
git commit -m "docs(frontend): document useCampDraftStore + collect-then-commit wizard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- #1 placeholders → Task 2 (strings) + Task 6 InfoStep (name/capacity/location placeholder) + existing group placeholder. ✅
- #2 location dropdown → Task 1 (`Select` + `CAMP_LOCATIONS`) + Task 6 InfoStep. ✅
- #3 location + capacity same row → Task 6 InfoStep (shared flex row). ✅
- #4 stepper redesign → Task 5. ✅
- #5 deferred + refresh-safe commit → Tasks 3 (store), 4 (orchestrator), 6 (steps + wizard wiring). Resumable retry via ledger. ✅
- #6 asterisks → Task 6 InfoStep (required labels) + Task 7 (organizers). ✅
- Docs update → Task 8. ✅

**Type consistency:** `tempId`/`groupTempId`/`groupIdMap`/`addedParticipantTempIds`/`published` used identically in store (Task 3), orchestrator (Task 4), and steps (Task 6). `InfoStep` prop `{ error }`, prop-less Groups/Participants/Review, unchanged `CampWizardProps` — matches callers. `useCommitCampDraft().mutateAsync()` → `Promise<string>` consumed in `CampWizard.goNext`. ✅

**Placeholder scan:** every code step contains complete code; no TBD/TODO. ✅

**Notes carried from the spec:** Review omits the organizer stat (no camp-scoped client source; org invites are immediate/global) — intentional. Partial-server-state-on-abandonment is inherent to per-entity endpoints; the ledger makes retries non-duplicating rather than transactional.
