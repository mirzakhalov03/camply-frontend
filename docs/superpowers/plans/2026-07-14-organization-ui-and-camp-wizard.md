# Organization UI + Reusable Camp-Creation Wizard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the Organization (`/admin`) surface to match the Design Prototype, and build the prototype's 5-step camp-creation flow as a **reusable wizard** shared by both the organization and the organizer surfaces.

**Architecture:** A new surface-agnostic `components/camp-wizard/` domain owns the multi-step flow. It creates a **draft** camp on step 1 (`POST /organizer/camps`), then operates on that camp id for groups/organizers/participants using endpoints that **already exist and already accept an organization caller** (the role guards are minimums; org sits above organizer). Nothing in the auth/permission backend is rewritten — we add only two thin frontend mutations (group create/delete, camp publish/update) over endpoints that already exist. The wizard's step list is **configurable per surface**: the org gets all 5 steps; the organizer gets 4 (the "Organizers" step is org-only because organizers cannot mint organizers).

**Tech Stack:** React 19 (JSX, no `import React`), TypeScript strict, Vite, Tailwind v4 (CSS-first tokens in `src/index.css`), TanStack React Query, Zustand (UI state only), React Router 7.

## Global Constraints

_Every task's requirements implicitly include this section._

- **No test runner** — this repo has none by project preference. Do **not** add or suggest tests. Verify each task with the repo loop: `npm run typecheck` → `npm run dev` (+ browser/headless screenshot of the route) → `npm run validate` (lint + format:check + typecheck).
- **Commits are gated on the user's explicit permission** (standing rule — never commit or push without it). Each task ends with a *prepared* commit the user may approve; do not run `git commit` unprompted.
- **Trilingual, no hard-coded copy.** Every user-facing string ships EN + UZ + RU in `src/i18n/translations.ts`, which is compiler-enforced (a missing key fails the build). New strings go in all three language blocks **and** the type interface.
- **No raw hex.** Use design tokens (`bg-pine`, `bg-canvas`, `text-content`, `rounded-card`, etc.). Raw hex is a dark-mode bug. Runtime group colors from `CAMP_GROUPS` (`lib/groups.ts`) are the documented exception (applied inline).
- **Dark mode works everywhere.** The prototype is light-only; extend it with the existing `.dark` token overrides — never hardcode light colors.
- **Enforce hierarchy server-side.** `POST /organizers` is organization-only. The organizer wizard must not render the Organizers step; a hidden button is not a permission — the server already rejects it, and we don't render a dead button.
- **Path alias `@/` → `src/`** for new files (e.g. `@/utils/phone`). `import type { … }` for type-only imports (`verbatimModuleSyntax` is on).
- **Prettier:** no semicolons, single quotes, trailing commas, width 100.
- **Reuse UI primitives** from `components/ui/` (`Button`, `Field`, `Sheet`, `Badge`, `Avatar`, `Skeleton`) — don't hand-roll inputs/buttons.

---

## File Structure

**New — the reusable wizard (surface-agnostic):**
- `src/components/camp-wizard/CampWizard.tsx` — orchestrator: step state, draft campId, stepper + sticky footer, renders active step.
- `src/components/camp-wizard/wizardTypes.ts` — shared types (`WizardStepKey`, `WizardDraft`, `CampWizardProps`).
- `src/components/camp-wizard/Stepper.tsx` — the top numbered step indicator (prototype lines 797–808).
- `src/components/camp-wizard/steps/InfoStep.tsx` — camp meta → creates/updates the draft camp.
- `src/components/camp-wizard/steps/GroupsStep.tsx` — add/rename/remove groups (live POST/DELETE).
- `src/components/camp-wizard/steps/OrganizersStep.tsx` — invite organizers by name+email+phone (org-only; email magic link).
- `src/components/camp-wizard/steps/ParticipantsStep.tsx` — per-group phone add (live POST roster).
- `src/components/camp-wizard/steps/ReviewStep.tsx` — summary + publish. **No join code.**

**New — organization surface (prototype-matched):**
- `src/components/organization/camps/OrgCampCard.tsx` — the "Camps history" camp card (replaces the old admin card usage).
- `src/components/organization/profile/AdminProfileScreen.tsx` — the org profile screen.
- `src/components/organization/camps/AdminCampDetailScreen.tsx` — org camp detail, reusing organizer tab components.

**Modify:**
- `src/api/services/campGroups.service.ts` — add `create` + `remove`.
- `src/api/queries/campGroups.queries.ts` — add `useCreateGroup`, `useDeleteGroup`.
- `src/api/services/camps.service.ts` — add `update` + `publish`.
- `src/api/queries/camps.queries.ts` — add `useUpdateCamp`, `usePublishCamp`.
- `src/components/organization/AdminNav.tsx` — nav items → Camps / Team / Profile.
- `src/components/organization/camps/AdminCampsScreen.tsx` — reskin to "Camps history"; flip mock → real.
- `src/components/organizer/camps/CampsScreen.tsx` — replace `NewCampSheet` with navigation to the shared wizard.
- `src/App.tsx` — org routes (`/admin/camps/new`, `/admin/camps/:campId`, `/admin/team`, `/admin/profile`) + organizer route (`/org/camps/new`).
- `src/i18n/translations.ts` — add `campWizard` + `orgProfile` groups; adjust `admin.nav`.

**Retire (do not delete blindly — see Task 11):**
- `src/components/organization/dashboard/DashboardScreen.tsx` — its stats fold into Camps history.
- `NewCampSheet.tsx` — superseded by the wizard (kept only if still imported; removed in Task 10).

---

## Phase 0 — Backend-boundary additions (thin, over endpoints that already exist)

### Task 1: Group create/delete + camp update/publish services & mutations

**Files:**
- Modify: `src/api/services/campGroups.service.ts`
- Modify: `src/api/queries/campGroups.queries.ts`
- Modify: `src/api/services/camps.service.ts`
- Modify: `src/api/queries/camps.queries.ts`

**Interfaces:**
- Produces:
  - `campGroupsService.create(campId: string, body: { name: string; color: string }): Promise<CampGroupDetail>`
  - `campGroupsService.remove(campId: string, groupId: string): Promise<void>`
  - `useCreateGroup(campId): UseMutationResult<CampGroupDetail, unknown, { name: string; color: string }>`
  - `useDeleteGroup(campId): UseMutationResult<void, unknown, string>` (variable = groupId)
  - `campsService.update(campId, body: Partial<CreateCampBody>): Promise<OrganizerCamp>`
  - `campsService.publish(campId): Promise<OrganizerCamp>`
  - `useUpdateCamp(campId)`, `usePublishCamp()` mutations

- [ ] **Step 1: Add `create` + `remove` to `campGroupsService`**

In `src/api/services/campGroups.service.ts`, extend the exported object (backend routes: `POST /organizer/camps/:id/groups` with `{ name, color }`, and `DELETE /organizer/camps/:id/groups/:gid`):

```ts
export const campGroupsService = {
  list: async (campId: string): Promise<CampGroupDetail[]> => {
    return (await axiosInstance.get<CampGroupDetail[]>(`/organizer/camps/${campId}/groups`)).data
  },

  /** Creates an empty group in the camp. Color is a brand-palette hex from CAMP_GROUPS. */
  create: async (campId: string, body: { name: string; color: string }): Promise<CampGroupDetail> => {
    return (await axiosInstance.post<CampGroupDetail>(`/organizer/camps/${campId}/groups`, body)).data
  },

  /** Removes a group (its members become unassigned server-side). */
  remove: async (campId: string, groupId: string): Promise<void> => {
    await axiosInstance.delete(`/organizer/camps/${campId}/groups/${groupId}`)
  },
}
```

- [ ] **Step 2: Add `useCreateGroup` + `useDeleteGroup`**

In `src/api/queries/campGroups.queries.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campGroupsService } from '../services/campGroups.service'
import { campKeys } from '../queryKeys'

export function useCampGroups(campId: string) {
  return useQuery({
    queryKey: campKeys.groups(campId),
    queryFn: () => campGroupsService.list(campId),
    enabled: Boolean(campId),
  })
}

export function useCreateGroup(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; color: string }) => campGroupsService.create(campId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: campKeys.groups(campId) }),
  })
}

export function useDeleteGroup(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => campGroupsService.remove(campId, groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: campKeys.groups(campId) }),
  })
}
```

- [ ] **Step 3: Add `update` + `publish` to `campsService`**

In `src/api/services/camps.service.ts`, add to the exported object (backend: `PATCH /organizer/camps/:id`, `POST /organizer/camps/:id/publish`):

```ts
  /** Edits a draft/published camp (used when the wizard's step 1 is revisited). */
  update: async (campId: string, body: Partial<CreateCampBody>): Promise<OrganizerCamp> => {
    return (await axiosInstance.patch<OrganizerCamp>(`/organizer/camps/${campId}`, body)).data
  },

  /** Flips a draft camp to published (wizard final step). */
  publish: async (campId: string): Promise<OrganizerCamp> => {
    return (await axiosInstance.post<OrganizerCamp>(`/organizer/camps/${campId}/publish`)).data
  },
```

- [ ] **Step 4: Add `useUpdateCamp` + `usePublishCamp`**

In `src/api/queries/camps.queries.ts` (mirror `useCreateCamp`'s invalidation of `organizerKeys.camps` + `organizerKeys.summary`; `useUpdateCamp` also invalidates `organizerKeys.camp(campId)`):

```ts
export function useUpdateCamp(campId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<CreateCampBody>) => campsService.update(campId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
      queryClient.invalidateQueries({ queryKey: organizerKeys.camp(campId) })
    },
  })
}

export function usePublishCamp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (campId: string) => campsService.publish(campId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizerKeys.camps })
      queryClient.invalidateQueries({ queryKey: organizerKeys.summary })
    },
  })
}
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck` → Expected: no errors. Run: `npm run lint` → Expected: clean.

- [ ] **Step 6: Prepare commit (await user OK before committing)**

```bash
git add src/api/services/campGroups.service.ts src/api/queries/campGroups.queries.ts src/api/services/camps.service.ts src/api/queries/camps.queries.ts
git commit -m "feat(api): add group create/delete + camp update/publish mutations"
```

---

## Phase 1 — The reusable Camp Wizard

### Task 2: Wizard types + shared copy keys

**Files:**
- Create: `src/components/camp-wizard/wizardTypes.ts`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Produces:
  - `type WizardStepKey = 'info' | 'groups' | 'organizers' | 'participants' | 'review'`
  - `type WizardDraft = { campId: string | null; name: string; location: string; starts: string; ends: string; capacity: string }`
  - `type CampWizardProps = { steps: WizardStepKey[]; onDone: (campId: string) => void; onCancel: () => void }`

- [ ] **Step 1: Create `wizardTypes.ts`**

```ts
/*
  Shared contracts for the reusable camp-creation wizard. Surface-agnostic: the org
  passes all five step keys, the organizer passes four (no 'organizers' — organizers
  cannot mint organizers, POST /organizers is org-only). The wizard creates a DRAFT
  camp on the info step and operates on that campId for every later step.
*/
export type WizardStepKey = 'info' | 'groups' | 'organizers' | 'participants' | 'review'

/** Step-1 form fields, kept in wizard state so revisiting the step PATCHes the camp. */
export type WizardDraft = {
  campId: string | null
  name: string
  location: string
  starts: string // YYYY-MM-DD (native date input)
  ends: string
  capacity: string
}

export type CampWizardProps = {
  /** Ordered steps for THIS surface. Org: all 5. Organizer: omit 'organizers'. */
  steps: WizardStepKey[]
  /** Called after the camp is published, with the real camp id (for navigation). */
  onDone: (campId: string) => void
  /** Called when the user backs out of step 1 (before a draft exists). */
  onCancel: () => void
}
```

- [ ] **Step 2: Add the `campWizard` translation group (type + all three languages)**

In `src/i18n/translations.ts`, add a `CampWizardStrings` interface and a `campWizard: CampWizardStrings` field to the root translations type, then add the block to `uz`, `ru`, and `en`. Use exactly this copy (EN/UZ/RU), keys verbatim:

| key | EN | UZ | RU |
|---|---|---|---|
| `title` | New camp | Yangi lager | Новый лагерь |
| `stepInfo` | Details | Ma'lumot | Данные |
| `stepGroups` | Groups | Guruhlar | Группы |
| `stepOrganizers` | Organizers | Tashkilotchi | Организаторы |
| `stepParticipants` | Participants | Ishtirokchi | Участники |
| `stepReview` | Review | Ko'rib chiqish | Проверка |
| `next` | Continue | Davom etish | Продолжить |
| `back` | Back | Orqaga | Назад |
| `finish` | Create camp | Lagerni yaratish | Создать лагерь |
| `groupsTitle` | Create groups | Guruhlarni yaratish | Создать группы |
| `groupsHint` | Name your groups first. You'll add people to them next. | Avval guruhlarni tuzing va nomlang. Keyin ularga odam qo'shasiz. | Сначала создайте и назовите группы. Затем добавите в них людей. |
| `groupNamePlaceholder` | New group name | Yangi guruh nomi | Название новой группы |
| `addGroup` | Add | Qo'shish | Добавить |
| `groupCount` | {count} groups created | {count} ta guruh tuzildi | Создано групп: {count} |
| `organizersTitle` | Invite organizers | Tashkilotchilarni qo'shish | Пригласить организаторов |
| `organizersHint` | Add name, email and phone. Each organizer gets an email link to finish signing up. | Ism, email va telefon qo'shing. Har bir tashkilotchiga ro'yxatdan o'tish uchun email havola yuboriladi. | Добавьте имя, email и телефон. Каждый организатор получит ссылку для регистрации. |
| `participantsTitle` | Add participants | Ishtirokchilarni qo'shish | Добавить участников |
| `participantsHint` | Pick a group, then add phone numbers. Each participant signs up with their own number. | Guruhni tanlang, so'ng telefon raqamlarini qo'shing. Har bir ishtirokchi o'z raqami bilan kiradi. | Выберите группу, затем добавьте номера. Каждый участник входит по своему номеру. |
| `pending` | Awaiting sign-up | Ro'yxatdan o'tishni kutmoqda | Ожидает регистрации |
| `reviewTitle` | Review & confirm | Ko'rib chiqing va tasdiqlang | Проверьте и подтвердите |
| `reviewHint` | Everything correct? Create the camp when ready. | Hammasi to'g'rimi? Tayyor bo'lsangiz, lagerni yarating. | Всё верно? Создайте лагерь, когда будете готовы. |
| `statGroups` | Groups | Guruh | Группы |
| `statOrganizers` | Organizers | Tashkilotchi | Организаторы |
| `statParticipants` | Participants | Ishtirokchi | Участники |
| `orgName` | First name | Ism | Имя |
| `orgSurname` | Last name | Familiya | Фамилия |
| `orgEmail` | Email | Email | Email |

> Follow the existing indentation/quote style in `translations.ts`. `{count}` is an `interpolate` token (see `@/utils/interpolate`).

- [ ] **Step 3: Verify** — `npm run typecheck` → Expected: PASS (all three language blocks satisfy the interface).

- [ ] **Step 4: Prepare commit**

```bash
git add src/components/camp-wizard/wizardTypes.ts src/i18n/translations.ts
git commit -m "feat(wizard): add wizard types and trilingual copy"
```

### Task 3: Stepper component

**Files:**
- Create: `src/components/camp-wizard/Stepper.tsx`

**Interfaces:**
- Consumes: `WizardStepKey` from `./wizardTypes`, `useTranslation`.
- Produces: `<Stepper steps={WizardStepKey[]} current={WizardStepKey} onJump={(k: WizardStepKey) => void} />`

- [ ] **Step 1: Implement the Stepper** (prototype lines 797–808: numbered circles + connector lines; active/complete in pine, upcoming muted). Only allow jumping *backwards* (to already-completed steps) — forward jumps are gated by the footer's Continue.

```tsx
import { useTranslation } from '../../i18n/useTranslation'
import type { WizardStepKey } from './wizardTypes'

const LABEL_KEY: Record<WizardStepKey, keyof ReturnType<typeof useTranslation>['t']['campWizard']> = {
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
  const currentIdx = steps.indexOf(current)

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-5 pb-1 pt-3 md:px-8">
      {steps.map((key, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        const reachable = i <= currentIdx
        return (
          <div key={key} className="flex flex-none items-center gap-1.5">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(key)}
              className="flex items-center gap-1.5 disabled:cursor-default"
            >
              <span
                className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-meta font-bold ${
                  active || done ? 'bg-pine text-white' : 'bg-soft text-muted'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-meta font-semibold ${active ? 'text-content' : 'text-muted'}`}
              >
                {t.campWizard[LABEL_KEY[key]]}
              </span>
            </button>
            {i < steps.length - 1 ? (
              <span
                className={`h-0.5 w-5 flex-none rounded ${done ? 'bg-pine' : 'bg-line'}`}
                aria-hidden
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify** — `npm run typecheck` → PASS. (Visual check happens once the orchestrator mounts it in Task 9.)

- [ ] **Step 3: Prepare commit** — `git add src/components/camp-wizard/Stepper.tsx && git commit -m "feat(wizard): add stepper"`

### Task 4: InfoStep — creates/updates the draft camp

**Files:**
- Create: `src/components/camp-wizard/steps/InfoStep.tsx`

**Interfaces:**
- Consumes: `WizardDraft` from `../wizardTypes`; `useCreateCamp`, `useUpdateCamp` from `@/api/queries/camps.queries` (Task 1); `Field` from `components/ui`.
- Produces: `<InfoStep draft={WizardDraft} onDraftChange={(patch: Partial<WizardDraft>) => void} onSaved={(campId: string) => void} registerSubmit={(fn: () => Promise<boolean>) => void} />`
  - `registerSubmit` hands the orchestrator an async "advance" function that returns `true` on success (camp created/updated) so the footer can gate Continue.

- [ ] **Step 1: Implement InfoStep**

Fields mirror `NewCampSheet` (name, location, start/end date, capacity) but laid out per prototype step 1 (lines 812–819) — labeled cards, dates side-by-side. On submit: if `draft.campId` is null → `useCreateCamp`, store the returned id via `onSaved`; else → `useUpdateCamp`. Return `true` only on success.

```tsx
import { useEffect, useRef } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { Field } from '../../ui'
import { useCreateCamp, useUpdateCamp } from '../../../api/queries/camps.queries'
import type { WizardDraft } from '../wizardTypes'

export function InfoStep({
  draft,
  onDraftChange,
  onSaved,
  registerSubmit,
}: {
  draft: WizardDraft
  onDraftChange: (patch: Partial<WizardDraft>) => void
  onSaved: (campId: string) => void
  registerSubmit: (fn: () => Promise<boolean>) => void
}) {
  const { t } = useTranslation()
  const c = t.createCamp // reuse existing camp-field labels (name/location/starts/ends/capacity/dateError)
  const create = useCreateCamp()
  const update = useUpdateCamp(draft.campId ?? '')

  // Keep the latest draft in a ref so the memoized submit fn always reads fresh values.
  const draftRef = useRef(draft)
  draftRef.current = draft

  useEffect(() => {
    registerSubmit(async () => {
      const d = draftRef.current
      if (!d.name.trim() || !d.location.trim() || !d.starts || !d.ends) return false
      if (d.ends < d.starts) return false
      const cap = d.capacity.trim() ? Number(d.capacity) : undefined
      const body = {
        name: d.name.trim(),
        location: d.location.trim(),
        startsAt: new Date(d.starts).toISOString(),
        endsAt: new Date(d.ends).toISOString(),
        ...(cap !== undefined && Number.isFinite(cap) && cap > 0 ? { capacity: cap } : {}),
      }
      try {
        if (d.campId) {
          await update.mutateAsync(body)
        } else {
          const camp = await create.mutateAsync(body)
          onSaved(camp.id)
        }
        return true
      } catch {
        return false
      }
    })
  }, [registerSubmit, create, update, onSaved])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">{c.name}</label>
        <Field value={draft.name} onChange={(e) => onDraftChange({ name: e.target.value })} autoComplete="off" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.starts}</label>
          <Field type="date" value={draft.starts} onChange={(e) => onDraftChange({ starts: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.ends}</label>
          <Field type="date" value={draft.ends} min={draft.starts} onChange={(e) => onDraftChange({ ends: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">{c.location}</label>
        <Field value={draft.location} onChange={(e) => onDraftChange({ location: e.target.value })} autoComplete="off" />
      </div>
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">{c.capacity}</label>
        <Field type="number" inputMode="numeric" min={1} value={draft.capacity} onChange={(e) => onDraftChange({ capacity: e.target.value })} />
      </div>
    </div>
  )
}
```

> **Note:** cover-image upload (prototype's dashed dropzone) is **out of scope** for v1 — `coverImage` stays null and cards fall back to a gradient (the backend already defaults it). Do not build an uploader here; it's a separate task if wanted later.

- [ ] **Step 2: Verify** — `npm run typecheck` → PASS.
- [ ] **Step 3: Prepare commit** — `git commit -m "feat(wizard): info step creates/updates draft camp"`

### Task 5: GroupsStep — live group create/remove

**Files:**
- Create: `src/components/camp-wizard/steps/GroupsStep.tsx`

**Interfaces:**
- Consumes: `useCampGroups`, `useCreateGroup`, `useDeleteGroup` (Task 1); `CAMP_GROUPS` from `@/lib/groups` (or `../../../lib/groups`) for palette colors; `Skeleton`, `Button` from `components/ui`.
- Produces: `<GroupsStep campId={string} />`

- [ ] **Step 1: Implement GroupsStep** (prototype lines 822–841). List existing groups (from `useCampGroups`), each removable; an "add" row that POSTs a new group with the next palette color. Assign `color` from `CAMP_GROUPS[existingCount % CAMP_GROUPS.length].color`.

```tsx
import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Skeleton } from '../../ui'
import { CAMP_GROUPS } from '../../../lib/groups'
import { useCampGroups, useCreateGroup, useDeleteGroup } from '../../../api/queries/campGroups.queries'

export function GroupsStep({ campId }: { campId: string }) {
  const { t } = useTranslation()
  const w = t.campWizard
  const groups = useCampGroups(campId)
  const createGroup = useCreateGroup(campId)
  const deleteGroup = useDeleteGroup(campId)
  const [name, setName] = useState('')

  const list = groups.data ?? []

  const add = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const color = CAMP_GROUPS[list.length % CAMP_GROUPS.length].color
    createGroup.mutate({ name: trimmed, color }, { onSuccess: () => setName('') })
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.groupsTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.groupsHint}</p>
      </div>

      {groups.isPending ? (
        <Skeleton className="h-16" tone="surface" />
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-input border border-line bg-surface px-3 py-2.5">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-green-tint text-body">🏕</span>
              <span className="flex-1 truncate text-body font-semibold text-content">{g.name}</span>
              <button
                type="button"
                aria-label="remove"
                onClick={() => deleteGroup.mutate(g.id)}
                className="flex-none px-2 text-subhead text-muted active:scale-90"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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
          disabled={!name.trim() || createGroup.isPending}
          className="flex-none rounded-input bg-pine px-3.5 py-2 text-caption font-bold text-white disabled:opacity-50 active:scale-95"
        >
          {w.addGroup}
        </button>
      </div>

      <p className="rounded-input bg-soft px-3.5 py-2.5 text-caption text-muted">
        {interpolate(w.groupCount, { count: list.length })}
      </p>
    </div>
  )
}
```

> Confirm `CAMP_GROUPS[i].color` is the property name by opening `src/lib/groups.ts`; if the field differs (e.g. `hex`), use that. If `green-tint` isn't a token, use `bg-soft`.

- [ ] **Step 2: Verify** — `npm run typecheck` → PASS.
- [ ] **Step 3: Prepare commit** — `git commit -m "feat(wizard): groups step with live create/remove"`

### Task 6: OrganizersStep — email magic-link invites (org-only)

**Files:**
- Create: `src/components/camp-wizard/steps/OrganizersStep.tsx`

**Interfaces:**
- Consumes: `useOrganizers`, `useCreateOrganizer` from `@/api/queries/organizers.queries` (confirm hook names in that file — `NewOrganizerSheet` already uses them); `PhoneInput` from `components/auth/PhoneInput`; `Field`, `Button` from `components/ui`; `PHONE_LENGTH` from `@/utils/phone`.
- Produces: `<OrganizersStep />` (no campId — organizers are invited org-wide via `POST /organizers`, exactly like `NewOrganizerSheet`).

- [ ] **Step 1: Implement OrganizersStep** (prototype lines 844–860, adapted to email+name per the approved design). Inline form (first name, last name, email, phone via `PhoneInput`) → on submit calls the create-organizer mutation (email link sent). Below, list pending/active organizers from `useOrganizers()` with a "pending" caption. Reuse the exact mutation `NewOrganizerSheet.tsx` calls — open that file to copy the hook + error-handling (409 → duplicate email vs duplicate phone) so behavior is identical.

```tsx
import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { Button, Field } from '../../ui'
import { PhoneInput } from '../../auth/PhoneInput'
import { PHONE_LENGTH } from '@/utils/phone'
import { ApiError } from '../../../api/axiosInstance'
import { useOrganizers, useCreateOrganizer } from '../../../api/queries/organizers.queries'

export function OrganizersStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const organizers = useOrganizers()
  const create = useCreateOrganizer()

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const valid = name.trim() && surname.trim() && email.trim() && phone.length === PHONE_LENGTH

  const submit = () => {
    if (!valid) return
    setError(null)
    create.mutate(
      { name: name.trim(), surname: surname.trim(), email: email.trim(), phone },
      {
        onSuccess: () => {
          setName(''); setSurname(''); setEmail(''); setPhone('')
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setError(err.message.toLowerCase().includes('phone') ? t.admin.organizers.duplicatePhone : t.admin.organizers.duplicate)
          } else {
            setError(err instanceof Error ? err.message : t.admin.organizers.duplicate)
          }
        },
      },
    )
  }

  const list = organizers.data ?? []

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.organizersTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.organizersHint}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
        <div className="flex gap-3">
          <Field placeholder={w.orgName} value={name} onChange={(e) => setName(e.target.value)} />
          <Field placeholder={w.orgSurname} value={surname} onChange={(e) => setSurname(e.target.value)} />
        </div>
        <Field type="email" placeholder={w.orgEmail} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
        <PhoneInput value={phone} onChange={setPhone} label={t.addParticipant.phone} error={t.login.phoneError} />
        {error ? <p role="alert" className="text-caption font-semibold text-danger">{error}</p> : null}
        <Button variant="primary" fullWidth disabled={!valid || create.isPending} onClick={submit}>
          {w.addGroup /* reuse "Add" label */}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {list.map((o) => (
          <div key={o.id} className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-body font-semibold text-content">
                {o.name} {o.surname}
              </div>
              <div className="truncate font-mono text-caption text-muted">{o.email ?? o.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

> **Verify hook names first.** Open `src/api/queries/organizers.queries.ts`: the mutation may be `useCreateOrganizer` or `useInviteOrganizer`, and `t.admin.organizers` may or may not have `duplicatePhone`/`duplicate`. Match the exact names used by `NewOrganizerSheet.tsx` (it already implements this flow). If a `duplicatePhone` key is missing, reuse the message string `NewOrganizerSheet` uses.

- [ ] **Step 2: Verify** — `npm run typecheck` → PASS.
- [ ] **Step 3: Prepare commit** — `git commit -m "feat(wizard): organizers step (email invite, org-only)"`

### Task 7: ParticipantsStep — per-group phone add

**Files:**
- Create: `src/components/camp-wizard/steps/ParticipantsStep.tsx`

**Interfaces:**
- Consumes: `useCampGroups` (Task 1) for the group chips; `useAddRoster`, `useRoster` from `@/api/queries/roster.queries`; `PhoneInput`, `PHONE_LENGTH`, `ApiError`.
- Produces: `<ParticipantsStep campId={string} />`

- [ ] **Step 1: Implement ParticipantsStep** (prototype lines 863–881). Horizontal group chips (from `useCampGroups`) select the target group; a `PhoneInput` + add button POSTs `{ phone, groupId }` via `useAddRoster`. Below, show that group's current members (filter `useRoster` by `groupId`). Surface the two 409s (`tooMany` / `duplicate`) exactly like `AddParticipantSheet`.

```tsx
import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { PhoneInput } from '../../auth/PhoneInput'
import { PHONE_LENGTH } from '@/utils/phone'
import { ApiError } from '../../../api/axiosInstance'
import { useCampGroups } from '../../../api/queries/campGroups.queries'
import { useAddRoster, useRoster } from '../../../api/queries/roster.queries'

export function ParticipantsStep({ campId }: { campId: string }) {
  const { t } = useTranslation()
  const w = t.campWizard
  const a = t.addParticipant
  const groups = useCampGroups(campId)
  const roster = useRoster(campId)
  const add = useAddRoster(campId)

  const [groupId, setGroupId] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const list = groups.data ?? []
  const activeGroup = groupId ?? list[0]?.id ?? null
  const members = (roster.data ?? []).filter((p) => p.groupId === activeGroup)
  const valid = phone.length === PHONE_LENGTH

  const submit = () => {
    if (!valid || !activeGroup) return
    setError(null)
    add.mutate(
      { phone, groupId: activeGroup },
      {
        onSuccess: () => setPhone(''),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setError(err.message.includes('2 camps') ? a.tooMany : a.duplicate)
          } else {
            setError(err instanceof Error ? err.message : a.duplicate)
          }
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.participantsTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.participantsHint}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {list.map((g) => {
          const on = g.id === activeGroup
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroupId(g.id)}
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
          <PhoneInput value={phone} onChange={(d) => { setPhone(d); if (error) setError(null) }} label={a.phone} error={t.login.phoneError} />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!valid || !activeGroup || add.isPending}
          className="mb-0.5 flex-none rounded-input bg-pine px-4 py-3 text-caption font-bold text-white disabled:opacity-50 active:scale-95"
        >
          {w.addGroup}
        </button>
      </div>
      {error ? <p role="alert" className="text-caption font-semibold text-danger">{error}</p> : null}

      <div className="flex flex-col gap-2">
        {members.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-body text-content">{p.phone ?? p.name}</div>
              <div className="text-meta text-muted">{w.pending}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify** — `npm run typecheck` → PASS.
- [ ] **Step 3: Prepare commit** — `git commit -m "feat(wizard): participants step (per-group phone add)"`

### Task 8: ReviewStep — summary + publish (no code)

**Files:**
- Create: `src/components/camp-wizard/steps/ReviewStep.tsx`

**Interfaces:**
- Consumes: `useOrganizerCamp` (Task 1 / existing), `useCampGroups`; `interpolate`.
- Produces: `<ReviewStep campId={string} />` — renders the camp summary + per-group counts. **The publish call itself lives in the orchestrator's footer** (Task 9), so the "Create camp" action is the wizard footer button; this component is display-only.

- [ ] **Step 1: Implement ReviewStep** (prototype lines 884–918 **minus the generated-code block** — no join code per the approved design). Camp summary card (name, dates, location) + a 3-up stat row (groups / organizers / participants) from `useOrganizerCamp(campId)` counts + a per-group list from `useCampGroups`.

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { Skeleton } from '../../ui'
import { useOrganizerCamp } from '../../../api/queries/camps.queries'
import { useCampGroups } from '../../../api/queries/campGroups.queries'

export function ReviewStep({ campId }: { campId: string }) {
  const { t } = useTranslation()
  const w = t.campWizard
  const camp = useOrganizerCamp(campId)
  const groups = useCampGroups(campId)

  if (camp.isPending) return <Skeleton className="h-40" tone="surface" />
  if (!camp.data) return <p className="text-body text-muted">{t.org.camps.error}</p>

  const c = camp.data
  const stats = [
    { label: w.statGroups, value: c.groupCount },
    { label: w.statOrganizers, value: c.organizerCount },
    { label: w.statParticipants, value: c.participantCount },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-title font-bold text-content">{w.reviewTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.reviewHint}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        <div className="text-heading font-bold text-content">{c.name}</div>
        <div className="flex flex-col gap-1.5 text-caption text-content">
          <div>📅 {c.dateRange}</div>
          <div>📍 {c.location}</div>
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
        {(groups.data ?? []).map((g) => (
          <div key={g.id} className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-3">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-input bg-green-tint">🏕</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-body font-bold text-content">{g.name}</div>
              <div className="text-meta text-muted">{g.memberCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify** — `npm run typecheck` → PASS.
- [ ] **Step 3: Prepare commit** — `git commit -m "feat(wizard): review step (summary, no join code)"`

### Task 9: CampWizard orchestrator

**Files:**
- Create: `src/components/camp-wizard/CampWizard.tsx`

**Interfaces:**
- Consumes: every step component; `Stepper`; `WizardDraft`, `WizardStepKey`, `CampWizardProps`; `usePublishCamp` (Task 1); `Button` from `components/ui`.
- Produces: `<CampWizard steps={…} onDone={…} onCancel={…} />`

- [ ] **Step 1: Implement the orchestrator**

Owns: step index, the `WizardDraft`, and the per-step "submit" fn (only InfoStep registers one; other steps persist live so their "advance" is a no-op that returns `true`). Footer: Back (or Cancel on step 0) + Continue. On the info step, Continue runs the registered submit and only advances on `true`. On the review step, Continue = "Create camp" → `usePublishCamp` → `onDone(campId)`. A camp id is guaranteed present after the info step. Header + full-height paper background per prototype (lines 791–795).

```tsx
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { Stepper } from './Stepper'
import { InfoStep } from './steps/InfoStep'
import { GroupsStep } from './steps/GroupsStep'
import { OrganizersStep } from './steps/OrganizersStep'
import { ParticipantsStep } from './steps/ParticipantsStep'
import { ReviewStep } from './steps/ReviewStep'
import { usePublishCamp } from '../../api/queries/camps.queries'
import type { CampWizardProps, WizardDraft, WizardStepKey } from './wizardTypes'

const EMPTY: WizardDraft = { campId: null, name: '', location: '', starts: '', ends: '', capacity: '' }

export function CampWizard({ steps, onDone, onCancel }: CampWizardProps) {
  const { t } = useTranslation()
  const w = t.campWizard
  const [idx, setIdx] = useState(0)
  const [draft, setDraft] = useState<WizardDraft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const publish = usePublishCamp()

  // InfoStep registers an async submit; other steps leave it null (advance freely).
  const submitRef = useRef<(() => Promise<boolean>) | null>(null)
  const registerSubmit = useCallback((fn: () => Promise<boolean>) => {
    submitRef.current = fn
  }, [])

  const current = steps[idx]
  const isFirst = idx === 0
  const isLast = idx === steps.length - 1

  const patchDraft = useCallback((patch: Partial<WizardDraft>) => setDraft((d) => ({ ...d, ...patch })), [])
  const onSaved = useCallback((campId: string) => setDraft((d) => ({ ...d, campId })), [])

  const goNext = async () => {
    if (busy) return
    // Run the step's registered submit (only InfoStep has one) before advancing.
    if (submitRef.current) {
      setBusy(true)
      const ok = await submitRef.current()
      setBusy(false)
      if (!ok) return
      submitRef.current = null
    }
    if (isLast) {
      if (!draft.campId) return
      setBusy(true)
      try {
        await publish.mutateAsync(draft.campId)
        onDone(draft.campId)
      } finally {
        setBusy(false)
      }
      return
    }
    setIdx((i) => i + 1)
  }

  const goBack = () => {
    if (isFirst) {
      onCancel()
      return
    }
    submitRef.current = null
    setIdx((i) => i - 1)
  }

  const jump = (key: WizardStepKey) => {
    const target = steps.indexOf(key)
    if (target <= idx) {
      submitRef.current = null
      setIdx(target)
    }
  }

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
        {current === 'info' && (
          <InfoStep draft={draft} onDraftChange={patchDraft} onSaved={onSaved} registerSubmit={registerSubmit} />
        )}
        {current === 'groups' && draft.campId && <GroupsStep campId={draft.campId} />}
        {current === 'organizers' && <OrganizersStep />}
        {current === 'participants' && draft.campId && <ParticipantsStep campId={draft.campId} />}
        {current === 'review' && draft.campId && <ReviewStep campId={draft.campId} />}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex gap-3 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-5 pb-6 pt-4 md:px-8">
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
          disabled={busy}
          className="flex-1 rounded-full bg-pine py-3.5 text-body font-bold text-white shadow-[0_8px_18px_rgba(15,107,79,0.28)] disabled:opacity-60 active:scale-95"
        >
          {isLast ? w.finish : w.next}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build** — `npm run typecheck` → PASS.
- [ ] **Step 3: Prepare commit** — `git commit -m "feat(wizard): orchestrator with configurable steps + publish"`

---

## Phase 2 — Wire the wizard into the organizer surface (proves reusability)

### Task 10: Organizer uses the shared wizard instead of NewCampSheet

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/organizer/camps/CampsScreen.tsx`
- Create: `src/components/organizer/camps/NewCampScreen.tsx` (thin surface adapter)

**Interfaces:**
- Consumes: `CampWizard` from `@/components/camp-wizard/CampWizard`.
- Produces: route `/org/camps/new`.

- [ ] **Step 1: Create the organizer adapter** `NewCampScreen.tsx` — passes the 4-step list (no `organizers`) and navigation:

```tsx
import { useNavigate } from 'react-router-dom'
import { CampWizard } from '../../camp-wizard/CampWizard'

export function NewCampScreen() {
  const navigate = useNavigate()
  return (
    <CampWizard
      steps={['info', 'groups', 'participants', 'review']}
      onDone={(campId) => navigate(`/org/camps/${campId}/participants`)}
      onCancel={() => navigate('/org/camps')}
    />
  )
}
```

- [ ] **Step 2: Add the route** in `App.tsx` inside the `/org` tree, **before** `camps/:campId` so `new` isn't captured as an id:

```tsx
<Route path="camps/new" element={<NewCampScreen />} />
```

Add the import: `import { NewCampScreen } from './components/organizer/camps/NewCampScreen'`.

- [ ] **Step 3: Point the organizer's "+ New camp" button at the route.** In `CampsScreen.tsx`: remove the `useState(newCampOpen)` + `<NewCampSheet …/>` usage and change the create button's `onClick` from `() => setNewCampOpen(true)` to `() => navigate('/org/camps/new')`. Remove the now-unused `NewCampSheet` import.

- [ ] **Step 4: Verify end-to-end** — `npm run dev`, log in as an organizer, `/org/camps` → "+ New camp" → walk Info → Groups → Participants → Review → Create. Confirm: a draft camp is created after step 1, groups/participants persist, and "Create camp" lands on the new camp. Screenshot each step. Then `npm run validate`.

- [ ] **Step 5: Delete `NewCampSheet.tsx`** (now unreferenced — confirm with `grep -rn NewCampSheet src`). Prepare commit: `git commit -m "feat(organizer): use shared camp wizard, retire NewCampSheet"`

---

## Phase 3 — Organization surface reskin (prototype-matched)

### Task 11: Org nav IA — Camps / Team / Profile + routes

**Files:**
- Modify: `src/components/organization/AdminNav.tsx`
- Modify: `src/App.tsx`
- Modify: `src/i18n/translations.ts` (`admin.nav`)

- [ ] **Step 1: Update nav items** in `AdminNav.tsx` `useNavItems()`:

```tsx
return [
  { to: '/admin/camps', label: t.admin.nav.camps, icon: <CampsIcon /> },
  { to: '/admin/team', label: t.admin.nav.team, icon: <OrganizersIcon /> },
  { to: '/admin/profile', label: t.admin.nav.profile, icon: <ProfileIcon /> },
]
```

Add a `ProfileIcon` (a simple person/circle svg — copy the shape from `OrganizersIcon` but single-person). Add `t.admin.nav.team` and `t.admin.nav.profile` keys to all three languages (Team: EN "Team" / UZ "Jamoa" / RU "Команда"; Profile: EN "Profile" / UZ "Profil" / RU "Профиль"). Keep `logout`. Remove the `dashboard` nav item; keep the `dashboard` string key or delete it if unused after Task 15.

- [ ] **Step 2: Rewire `/admin` routes** in `App.tsx`:

```tsx
<Route element={<RequireAdmin />}>
  <Route path="/admin" element={<AdminShell />}>
    <Route index element={<Navigate to="camps" replace />} />
    <Route path="camps" element={<AdminCampsScreen />} />
    <Route path="camps/new" element={<AdminNewCampScreen />} />
    <Route path="camps/:campId" element={<AdminCampDetailScreen />} />
    <Route path="team" element={<OrganizersScreen />} />
    <Route path="profile" element={<AdminProfileScreen />} />
  </Route>
</Route>
```

`camps/new` before `camps/:campId`. Add imports for `AdminNewCampScreen`, `AdminCampDetailScreen`, `AdminProfileScreen` (created below). Keep `/admin/login` and `RequireAdmin` unchanged. Point the old `/admin/dashboard` and `/admin/organizers` at redirects (`<Route path="dashboard" element={<Navigate to="camps" replace />} />`, `organizers` → `team`) so any existing deep links/pushes still resolve.

- [ ] **Step 3: Create `AdminNewCampScreen.tsx`** (org adapter — all 5 steps):

```tsx
import { useNavigate } from 'react-router-dom'
import { CampWizard } from '../../camp-wizard/CampWizard'

export function AdminNewCampScreen() {
  const navigate = useNavigate()
  return (
    <CampWizard
      steps={['info', 'groups', 'organizers', 'participants', 'review']}
      onDone={(campId) => navigate(`/admin/camps/${campId}`)}
      onCancel={() => navigate('/admin/camps')}
    />
  )
}
```

Place at `src/components/organization/camps/AdminNewCampScreen.tsx`.

- [ ] **Step 4: Verify** — `npm run typecheck` → PASS; `npm run dev` → `/admin` redirects to `/admin/camps`, bottom nav + sidebar show Camps/Team/Profile.
- [ ] **Step 5: Prepare commit** — `git commit -m "feat(admin): nav IA (camps/team/profile) + wizard route"`

### Task 12: Camps history screen + card (flip mock → real)

**Files:**
- Modify: `src/components/organization/camps/AdminCampsScreen.tsx`
- Create: `src/components/organization/camps/OrgCampCard.tsx`

- [ ] **Step 1: Build `OrgCampCard`** (prototype lines 1225–1236): rounded-card, a gradient cover strip with a status Badge, name, `📍 location · dateRange`, and a 3-count row (participants / organizers / groups). Links to `/admin/camps/:id`. Use the `Badge` primitive for status; map `status` → tone (`active`→pine, `upcoming`→amber, `draft`→muted, `archived`→muted). Take an `OrganizerCamp` prop.

```tsx
import { Link } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { Badge } from '../../ui'
import type { OrganizerCamp } from '../../../api/services/camps.service'

const TONE: Record<OrganizerCamp['status'], 'pine' | 'amber' | 'muted'> = {
  active: 'pine',
  upcoming: 'amber',
  draft: 'muted',
  archived: 'muted',
}

export function OrgCampCard({ camp }: { camp: OrganizerCamp }) {
  const { t } = useTranslation()
  const s = t.admin.camps.status // { active, upcoming, draft, archived }
  return (
    <Link
      to={`/admin/camps/${camp.id}`}
      className="block overflow-hidden rounded-card border border-line bg-surface shadow-[0_5px_18px_rgba(20,40,30,0.06)] active:scale-[0.99]"
    >
      <div className="relative h-[70px] bg-gradient-to-br from-pine to-deep">
        <span className="absolute left-3.5 top-3">
          <Badge tone={TONE[camp.status]}>{s[camp.status]}</Badge>
        </span>
      </div>
      <div className="px-4 py-3.5">
        <div className="text-title font-bold text-content">{camp.name}</div>
        <div className="mt-0.5 text-caption text-muted">📍 {camp.location} · {camp.dateRange}</div>
        <div className="mt-3 flex gap-5">
          <Stat value={camp.participantCount} label={t.campWizard.statParticipants} />
          <Stat value={camp.organizerCount} label={t.campWizard.statOrganizers} />
          <Stat value={camp.groupCount} label={t.campWizard.statGroups} />
        </div>
      </div>
    </Link>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <span className="text-title font-bold text-content">{value}</span>
      <span className="text-caption text-muted"> {label.toLowerCase()}</span>
    </div>
  )
}
```

> Confirm `Badge`'s prop is `tone` and accepts `pine|amber|muted` (open `components/ui/Badge.tsx`); adjust if the prop/name differs. Confirm `t.admin.camps.status` exists — if not, add the four status labels to all three languages.

- [ ] **Step 2: Reskin `AdminCampsScreen`** to "Camps history" (prototype lines 1199–1238) and **flip to real data**: replace `useAdminCamps` with `useOrganizerCamps` + `useOrganizerSummary` (already imported patterns exist in the organizer `CampsScreen`). Gradient header with org label + 3 stat pills (total camps / active / participants), a dashed "Create new camp" CTA linking to `/admin/camps/new`, then the camp cards. Keep loading (`Skeleton`) / empty / error states.

```tsx
import { Link } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { Skeleton } from '../../ui'
import { useOrganizerCamps, useOrganizerSummary } from '../../../api/queries/camps.queries'
import { OrgCampCard } from './OrgCampCard'

export function AdminCampsScreen() {
  const { t } = useTranslation()
  const camps = useOrganizerCamps()
  const summary = useOrganizerSummary()

  const list = camps.data ?? []
  const active = list.filter((c) => c.status === 'active').length

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <h1 className="text-subhead font-bold text-white">{t.admin.camps.title}</h1>
        <div className="mt-4 flex gap-2.5">
          <HeaderStat value={list.length} label={t.admin.camps.total} />
          <HeaderStat value={active} label={t.admin.camps.active} />
          <HeaderStat value={summary.data?.totalParticipants ?? 0} label={t.campWizard.statParticipants} />
        </div>
      </div>

      <div className="flex flex-col gap-3.5 px-5 pt-4 md:px-8">
        <Link
          to="/admin/camps/new"
          className="flex items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-3.5 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-input bg-pine text-white">＋</span>
          <div>
            <div className="text-body font-bold text-content">{t.admin.camps.create}</div>
            <div className="text-caption text-muted">{t.admin.camps.createHint}</div>
          </div>
        </Link>

        {camps.isPending ? (
          <Skeleton className="h-40" tone="surface" />
        ) : camps.isError ? (
          <p className="py-8 text-center text-body text-muted">{t.admin.camps.loadError}</p>
        ) : list.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-title font-bold text-content">{t.admin.camps.empty}</p>
            <p className="mt-1 text-caption text-muted">{t.admin.camps.emptyHint}</p>
          </div>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {list.map((camp) => <OrgCampCard key={camp.id} camp={camp} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function HeaderStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-input bg-white/12 px-3 py-2.5">
      <div className="text-subhead font-bold text-white">{value}</div>
      <div className="text-meta text-white/75">{label}</div>
    </div>
  )
}
```

Add missing string keys (`admin.camps.total`, `.active`, `.create`, `.createHint`) to all three languages (EN: Total camps / Active / Create new camp / Details · organizers · participants; UZ: Jami lager / Faol / Yangi lager yaratish / Ma'lumot · tashkilotchilar · ishtirokchilar; RU: Всего лагерей / Активные / Создать лагерь / Данные · организаторы · участники).

- [ ] **Step 3: Verify** — `npm run dev` → `/admin/camps` shows real camps (create one via the wizard first). Screenshot. `npm run validate`.
- [ ] **Step 4: Prepare commit** — `git commit -m "feat(admin): camps-history screen + card, real data"`

### Task 13: Org profile screen

**Files:**
- Create: `src/components/organization/profile/AdminProfileScreen.tsx`
- Modify: `src/i18n/translations.ts` (`orgProfile` group)

- [ ] **Step 1: Build `AdminProfileScreen`** (prototype lines 1284–1322): gradient header, an identity card (🏛 tile, org name, badges, 3 stats derived from `useOrganizerCamps`/`useOrganizerSummary`), a contact list, a settings list (Team → `/admin/team`, Language → reuse the participant `LanguageSheet` component, Logout). Logout uses the shell's real logout via `useOutletContext<AdminContext>()` (`adminContext.ts`). Read the org's identity from `useAuthStore((s) => s.user)`.

Add an `orgProfile` translation group with keys: `title`, `role` (Organization), `email`, `phone`, `address`, `team`, `language`, `logout`, `statCamps`, `statParticipants`, `statOrganizers` — EN/UZ/RU. Reuse `t.admin.nav.logout` if simpler.

> Use tokens throughout; the identity 🏛 tile may use a `from-pine to-deep` gradient. For the language row, open `src/components/participant/profile/LanguageSheet.tsx` and reuse it (it's already trilingual and theme-aware).

- [ ] **Step 2: Verify** — `npm run dev` → `/admin/profile` renders; language switch works; logout returns to `/admin/login`. Screenshot light + dark. `npm run validate`.
- [ ] **Step 3: Prepare commit** — `git commit -m "feat(admin): organization profile screen"`

### Task 14: Org camp detail — reuse organizer tabs

**Files:**
- Create: `src/components/organization/camps/AdminCampDetailScreen.tsx`

**Interfaces:**
- Consumes: `useOrganizerCamp(campId)`; the organizer tab components `ParticipantsTab`, `GroupsTab`, `LeaderboardTab`, `ScheduleTab`, `AnnouncementsTab` from `components/organizer/detail/**`.

- [ ] **Step 1: Inspect the tab components' data dependencies.** Open `ParticipantsTab.tsx` and `GroupsTab.tsx`: confirm they read `campId` from `useParams()` (route param) and fetch via React Query hooks — if so they're portable to `/admin/camps/:campId` unchanged. If any reads organizer-shell Outlet context (`useCamp()`/`campDetailContext`) instead of `useParams`, note it: the admin detail must provide that context or the tab must be refactored to take a `campId` prop. Record which tabs are portable.

- [ ] **Step 2: Build `AdminCampDetailScreen`** — a header (prototype lines 1245–1259: gradient + floating stat card from `useOrganizerCamp`) + a tab strip (Participants / Groups / Leaderboard / Schedule / Announcements) that renders the corresponding **existing** organizer tab component for the `:campId` from `useParams`. Reuse `campFeatures.tsx`'s feature list/labels if convenient for the tab strip. Back arrow → `/admin/camps`.

> If Step 1 found the tabs coupled to the organizer Outlet context, the minimal fix is to wrap them in the same context provider the organizer detail uses (`campDetailContext`), supplying `{ campId }`. Prefer reuse over duplicating tab UIs. Do **not** rebuild the prototype's simpler "group composition" view — the richer organizer tabs are the approved choice.

- [ ] **Step 3: Verify** — `npm run dev` → open a camp from `/admin/camps`; each tab loads real data. Screenshot. `npm run validate`.
- [ ] **Step 4: Prepare commit** — `git commit -m "feat(admin): camp detail reusing organizer tabs"`

### Task 15: Retire the dashboard, reconcile translations

**Files:**
- Modify: `src/i18n/translations.ts`
- Delete: `src/components/organization/dashboard/DashboardScreen.tsx` (after confirming no imports remain)

- [ ] **Step 1: Confirm `DashboardScreen` is unreferenced** — `grep -rn "DashboardScreen" src`. If only its own file matches, delete it. If `App.tsx` still imports it, ensure Task 11's redirect replaced the route, then remove the import and delete the file.
- [ ] **Step 2: Remove now-dead translation keys** only if fully unused (`grep` each candidate like `admin.dashboard`), else leave them. Do not remove keys still referenced.
- [ ] **Step 3: Verify** — `npm run validate` → PASS (lint's `noUnusedLocals`/unused-import rules will catch stragglers).
- [ ] **Step 4: Prepare commit** — `git commit -m "chore(admin): retire dashboard, fold stats into camps history"`

---

## Phase 4 — Final pass

### Task 16: Dark mode + i18n + responsive sweep

**Files:** all new components from Tasks 3–14.

- [ ] **Step 1: Dark-mode audit** — toggle dark mode (the theme switch on the participant profile, or set `.dark` on `<html>` in devtools) and screenshot every new screen: wizard (all steps), camps history, org card, profile, camp detail. Fix any element that doesn't flip — the cause is always a raw color; replace with a token. Header gradients (`from-pine to-deep`) and `text-white` on them are fine in both themes.
- [ ] **Step 2: i18n audit** — switch to UZ then RU; confirm no English leaks (no hard-coded strings) across all new screens. Any literal string found → move it into `translations.ts` (all three languages) and read it via `t`.
- [ ] **Step 3: Responsive audit** — at mobile (375px), tablet (768px), desktop (1280px): the wizard footer stays reachable, the stepper scrolls horizontally without breaking the page, camps history is 1-col mobile / 2-col md, and the body never scrolls horizontally.
- [ ] **Step 4: Full verify** — `npm run validate` → PASS. Walk both flows once more: organizer `/org/camps/new` (4 steps) and org `/admin/camps/new` (5 steps) → each creates a real published camp.
- [ ] **Step 5: Prepare final commit** — `git commit -m "polish(admin+wizard): dark mode, i18n, responsive sweep"`

---

## Self-Review

**Spec coverage vs. the approved design:**
- Reskin org surface to prototype → Tasks 11 (nav), 12 (camps history), 13 (profile), 14 (camp detail). ✅
- 5-step wizard identical to prototype except the 6-digit code → Tasks 2–9; code explicitly omitted (Task 8). ✅
- Reusable wizard, shared by organizer + org → surface-agnostic `camp-wizard/` (Tasks 2–9), organizer adapter (Task 10), org adapter (Task 11 Step 3). ✅
- "Don't rewrite backend logic" → only two additive frontend mutation layers (Task 1) over pre-existing endpoints; no backend changes. ✅
- Email magic link for organizers → Task 6 reuses the existing invite flow; step is org-only (hierarchy honored). ✅
- Trilingual + dark mode + responsive → woven per-task + swept in Task 16. ✅

**Open verification the executor must do (flagged inline, not placeholders):** exact prop names of `Badge` (Task 12), the organizer-invite hook name in `organizers.queries.ts` (Task 6), the `CAMP_GROUPS` color field (Task 5), and whether organizer detail tabs read `useParams` vs Outlet context (Task 14). Each task says to confirm by opening the named file and gives the fallback.

**Type consistency:** `WizardDraft`/`WizardStepKey`/`CampWizardProps` defined once (Task 2) and consumed unchanged in Tasks 4–11. Mutation hook names (`useCreateGroup`, `useDeleteGroup`, `useUpdateCamp`, `usePublishCamp`) defined in Task 1 and used verbatim later.
