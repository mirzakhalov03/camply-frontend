# Camp wizard optimization — design

**Date:** 2026-07-15
**Scope:** Frontend repo only (backend untouched — existing per-entity endpoints reused). Branch off `dev`.
**Status:** approved
**Surfaces:** shared wizard — organization (5 steps) + organizer (4 steps, no `organizers`).

## Problem

The camp-creation wizard (`components/camp-wizard/`) works but has accumulated UX
rough edges and one architectural liability:

1. **No input placeholders** — fields carry only labels; empty state is bare.
2. **Location is free text** — should be a dropdown constrained to the org's two
   sites: `Bo'stonliq`, `Renesans`.
3. **Location + Capacity each take a full row** — wasteful; they belong on one line
   like Starts/Ends.
4. **The top progress stepper is poor** — five numbered pills + connector lines
   overflow-scroll and read as cramped on mobile.
5. **The wizard writes to the backend as you go.** It is "draft-first": InfoStep
   `POST`s a draft camp on Continue so later steps have a `campId`; groups and
   participants are `POST`ed the moment you add them. Consequences: a half-built
   camp litters the server if the user abandons the flow, and nothing survives a
   page refresh (the `campId` lives in component state).
6. **Required fields aren't marked** — no asterisks.

## Backend reality (constrains #5)

The API is **per-entity, with no batch "create whole camp" endpoint**:

- `POST /organizer/camps` → returns a **draft** camp
- `PATCH /organizer/camps/:id`
- `POST /organizer/camps/:id/groups`, `DELETE …/groups/:id`
- `POST /organizer/camps/:id/roster`
- `POST /organizer/camps/:id/publish`
- Organizers: `POST /organizers` — **org-global invite (sends email), not
  camp-scoped.**

Therefore "nothing until final submit" (#5) cannot be a small tweak: groups and
participants have nothing to attach to until a camp exists, so the whole wizard must
become **collect-in-memory → commit-at-the-end**, and the final commit orchestrates
the sequence `create camp → groups → participants → publish` itself.

## Decisions (locked)

- **Commit strategy: resumable retry.** The commit records what already succeeded in
  a persisted ledger; a mid-way failure surfaces inline with "Try again" that
  resumes from where it stopped — no duplicates. A closed tab leaves a recoverable
  draft that resumes on reopen.
- **Progress control (#4): redesign the top stepper only** (`Stepper.tsx`). The
  bottom Back/Next bar is left as-is.
- **Organizers step: invites stay immediate.** They're org-wide and independent of
  this camp (not "wasted" if the wizard is abandoned), so they are **excluded** from
  the deferred batch. The step is otherwise untouched.

## Design

### A. InfoStep form (#1, #2, #3, #6)

New layout, every field bound to the draft store (§D):

```
Name *                [ e.g. Bo'stonliq Summer 2026 ]
Starts *   Ends *     [ date ]        [ date ]
Location * Capacity   [ Select ▾ ]    [ e.g. 40 ]
```

- **Placeholders** on name and capacity; the location select shows a "Select
  location" placeholder option. Date inputs are native pickers (no placeholder).
- **Location dropdown** — new `Select` UI primitive (§C) fed a `CAMP_LOCATIONS`
  constant `['Bo'stonliq', 'Renesans']`. Place names are **not** translated.
- **Location + Capacity on one row** (flex, mirrors the Starts/Ends row).
- **Required asterisks** — `*` in `text-danger` on name, starts, ends, location.
  Capacity stays optional. The Organizers form's required fields (name, surname,
  email, phone) get the same marker for consistency.
- **Validation** (unchanged rules, now a pure gate — no network): name + location +
  starts + ends required; `ends >= starts`; capacity optional and, if present, a
  finite integer > 0.

### B. Stepper redesign (#4)

Replace the numbered-pills row with:

- A label line: **`Step {n} of {total}`** (`text-meta`, muted) + the current step
  name in heading weight.
- A row of thin segmented bars (one per step, `flex-1`, `~h-1.5`, rounded): pine for
  done/active, `bg-line`/soft for upcoming, with a smooth color/width transition on
  advance.
- Each segment is a button; **completed** segments stay tappable to jump **back**
  (current behavior preserved), forward stays locked.

Uses design tokens only (`bg-pine`, `bg-line`, `text-muted`, `text-content`). New
i18n key `campWizard.stepProgress` (`Step {n} of {total}`) with `{n}`/`{total}`
tokens via `interpolate`.

### C. `Select` UI primitive (`components/ui/Select.tsx`)

A small styled native `<select>` matching `Field` (pine focus ring, `rounded-input`,
`bg-surface`, tokens). Props mirror `Field` where sensible plus `options` +
`placeholder`. Exported from the `ui` barrel. Native `<select>` is deliberate — best
mobile UX (OS picker), a11y for free, no external dep. First consumer is the location
field; kept minimal, not over-abstracted.

### D. Deferred commit + refresh-safe draft (#5)

**New persisted store — `store/useCampDraftStore.ts`** (`persist` middleware →
localStorage key `camply-camp-draft`). Survives refresh and PWA relaunch. An
uncommitted wizard is client-owned form state, not server data, so a Zustand store is
the architecturally correct home (per `frontend/CLAUDE.md`). Shape:

```ts
type DraftGroup = { tempId: string; name: string; color: string }
type DraftParticipant = { tempId: string; phone: string; groupTempId: string }

type Progress = {
  campId: string | null                 // set once the camp is created
  groupIdMap: Record<string, string>    // group tempId → real id
  addedParticipantTempIds: string[]     // participants already POSTed
  published: boolean
}

type CampDraftState = {
  info: { name: string; location: string; starts: string; ends: string; capacity: string }
  groups: DraftGroup[]
  participants: DraftParticipant[]
  progress: Progress
  // actions
  patchInfo(patch): void
  addGroup(name): void          // assigns next CAMP_GROUPS color + a tempId
  removeGroup(tempId): void     // also drops participants in that group
  addParticipant(phone, groupTempId): void
  removeParticipant(tempId): void
  // commit ledger setters
  setCampId(id): void
  mapGroupId(tempId, realId): void
  markParticipantAdded(tempId): void
  markPublished(): void
  reset(): void
}
```

`tempId` via `crypto.randomUUID()`.

**Steps stop touching the API as you go:**

- **InfoStep** — pure form over `info`; no mutation on Continue.
- **GroupsStep** — add/remove against `groups` (color assigned client-side from the
  existing `CAMP_GROUPS` cycle). No `campId`, no API.
- **ParticipantsStep** — group chips from `groups` (by `tempId`); add/list from
  `participants`. Duplicate-phone check becomes a **client-side** check against
  `participants` already in the store.
- **ReviewStep** — renders entirely **from the store**: name, client-derived date
  range, group count, participant count, per-group members. Nothing exists
  server-side yet, so no fetch.
- **OrganizersStep** — unchanged (immediate invites).

**Commit — `useCommitCampDraft()` (`api/queries/campDraft.queries.ts`)**, a
`useMutation` orchestrating the existing services, resumable via `progress`:

1. `progress.campId` empty → `campsService.create(info)` → `setCampId`.
2. For each group whose `tempId` is not in `groupIdMap` → `campGroupsService.create`
   → `mapGroupId(tempId, realId)`.
3. For each participant not in `addedParticipantTempIds` → resolve its group's real
   id via `groupIdMap` → `rosterService.add` → `markParticipantAdded`.
4. `campsService.publish(campId)` → `markPublished`.
5. On overall success → invalidate `organizerKeys.camps`/`summary` → `reset()` →
   `onDone(campId)`.

Each stage reads the ledger first, so **retry skips completed work** (no duplicate
camps/groups/participants). Errors surface inline on the final step with a "Try
again" that re-invokes the mutation. Store `reset()` also fires when the user cancels
out of step 1.

**Ripple:**

- `CampWizard.tsx` — remove the `submitRef` / per-step `registerSubmit` machinery and
  the `&& draft.campId` render-gating. Advancing is now a pure validation gate; the
  network is touched **only** on Finish (commit). Draft state comes from the store,
  not local `useState`.
- `wizardTypes.ts` — `WizardDraft` moves into the store; the file keeps
  `WizardStepKey` + `CampWizardProps`.
- `AdminNewCampScreen` / organizer `NewCampScreen` — unchanged contract:
  `onDone(campId)` still receives a real id (from commit) for navigation.

### E. i18n (trilingual — UZ/RU/EN)

New `campWizard` keys, all three languages: `stepProgress` (`Step {n} of {total}`),
`namePlaceholder`, `capacityPlaceholder`, `locationPlaceholder`, `commitError`,
`retry`, `creating`. Location option labels are proper nouns — not translated.

### F. Docs

This adds a persisted Zustand store and changes the wizard's data model, so
`frontend/CLAUDE.md` is updated in the same change: add `useCampDraftStore` to the
store list and revise the camp-wizard note (draft-first → collect-then-commit).

## Files

**New**
- `store/useCampDraftStore.ts`
- `api/queries/campDraft.queries.ts`
- `components/ui/Select.tsx`
- a `CAMP_LOCATIONS` constant (colocated, e.g. `lib/campLocations.ts` alongside
  `lib/groups.ts`)

**Edited**
- `components/camp-wizard/CampWizard.tsx`
- `components/camp-wizard/Stepper.tsx`
- `components/camp-wizard/wizardTypes.ts`
- `components/camp-wizard/steps/{Info,Groups,Participants,Review}Step.tsx`
- `components/camp-wizard/steps/OrganizersStep.tsx` (asterisks only)
- `components/ui/index.ts` (barrel — export `Select`)
- `i18n/translations.ts`
- `frontend/CLAUDE.md`

## Non-goals

- No backend changes; no new batch endpoint.
- Organizers step behavior (immediate org-global invites) is unchanged.
- No wizard-abandonment TTL / auto-expiry of a stale persisted draft (a leftover
  draft simply restores on reopen). Revisit only if it proves annoying.

## Tradeoffs named

- **Partial server state on abandonment mid-commit** is inherent to per-entity
  endpoints with no transaction. The resumable ledger mitigates it (recoverable
  draft, no duplicates on retry) rather than eliminating it.
- **Review counts are client-derived**, not a server round-trip — which is *more*
  accurate here, since nothing is committed until Finish.
