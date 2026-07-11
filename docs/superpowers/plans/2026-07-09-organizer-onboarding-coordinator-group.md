# Organizer Onboarding — Coordinator Group Selection: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When an organizer picks the **coordinator** role during onboarding, make them choose one camp group before entering; persist organizer role + group; other roles are unaffected.

**Architecture:** A new canonical `lib/groups.ts` is the single source of group identity (consolidating `mockLeaderboard`). A new `useOrganizerStore` holds organizer role + group (the twin of `useProfileStore`). A new no-search `GroupPicker` (sibling of `CityPicker`) renders only for coordinators inside `OrganizerInfoForm`'s `extraFields`; `ProfileForm` gains one `onCommit` seam so identity persists at submit.

**Tech Stack:** React 19 (JSX, no `import React`), TypeScript (strict-ish, `import type`), Zustand, Tailwind v4 CSS-first, oxlint, Prettier.

## Global Constraints

- **No test runner** — verification is `npm run typecheck` + `npm run lint`, plus manual UI checks. Do NOT add tests.
- **Commits are gated** — the user's hard rule is *no git commits without explicit permission*. Treat every "Checkpoint" below as a stop: only commit if the user has said so. Never run `git commit` otherwise.
- **`import type { ... }`** for type-only imports (`verbatimModuleSyntax` is on). No `import React`.
- **Trilingual, no hard-coded copy** — every user-facing string ships UZ/RU/EN in `translations.ts`. Exception: group/city **names** are proper nouns and stay literal.
- **Relative imports only** (no path aliases). Prettier: no semicolons, single quotes, trailing commas, width 100.
- **Format only touched files, preserving endings:** `npx prettier --write --end-of-line auto <files>` (never format the whole tree — see frontend CLAUDE.md Windows caveat).
- Run all `npm` commands from `camply-frontend/`.

---

### Task 1: Canonical group list + leaderboard consolidation

**Files:**
- Create: `camply-frontend/src/lib/groups.ts`
- Modify: `camply-frontend/src/lib/mockLeaderboard.ts` (full rewrite)

**Interfaces:**
- Produces: `type CampGroup = { id: string; name: string; color: string }` and `const CAMP_GROUPS: CampGroup[]` (6 groups). Consumed by Tasks 2, 3, 4.

- [ ] **Step 1: Create `lib/groups.ts`**

```ts
/*
  Canonical camp-groups list — the ONE place group identity (id, name, color) is
  defined. Group names are proper nouns, so they stay literal in every language
  (same call as lib/cities.ts), never routed through i18n.

  Read statically today, exactly like CITIES feeds CityPicker. Groups are
  ultimately camp-scoped server data: when camp-selection + the backend land this
  becomes a `useCampGroups(campId)` fetch (see the lib/<domain>.ts data boundary).
  For now every group-selection surface reads CAMP_GROUPS.
*/
export type CampGroup = {
  id: string
  name: string
  /** Brand-palette color for the group's swatch. Applied as an inline style. */
  color: string
}

export const CAMP_GROUPS: CampGroup[] = [
  { id: 'foxes', name: 'Summit Foxes', color: '#e0982a' },
  { id: 'wolves', name: 'Pine Wolves', color: '#0f6b4f' },
  { id: 'hawks', name: 'River Hawks', color: '#5aa9c4' },
  { id: 'blazers', name: 'Trail Blazers', color: '#c97b5a' },
  { id: 'otters', name: 'Lake Otters', color: '#3f9d8e' },
  { id: 'eagles', name: 'Camp Eagles', color: '#5f7d6a' },
]
```

- [ ] **Step 2: Rewrite `lib/mockLeaderboard.ts` to source identity from `CAMP_GROUPS`**

```ts
import type { Leaderboard, LeaderboardGroup } from './leaderboard'
import { CAMP_GROUPS } from './groups'

/*
  The ONLY hardcoded leaderboard content. Group IDENTITY (name, color) is NOT
  duplicated here — it's spread from CAMP_GROUPS so there's exactly one source of
  truth for group names. This file owns only the leaderboard-specific numbers
  (scores + breakdown), keyed by the canonical group id. Shaped exactly like the
  future API response (`Leaderboard`), so fetchLeaderboard() swaps in one line.
*/
type GroupScores = Omit<LeaderboardGroup, 'id' | 'name' | 'color'>

const SCORES: Record<string, GroupScores> = {
  foxes: { score: 1320, previousScore: 1180, breakdown: { activities: 560, attendance: 480, challenges: 280 } },
  wolves: { score: 1280, previousScore: 1190, breakdown: { activities: 520, attendance: 500, challenges: 260 } },
  hawks: { score: 1150, previousScore: 1240, breakdown: { activities: 480, attendance: 440, challenges: 230 } },
  blazers: { score: 980, previousScore: 980, breakdown: { activities: 400, attendance: 380, challenges: 200 } },
  otters: { score: 870, previousScore: 760, breakdown: { activities: 360, attendance: 320, challenges: 190 } },
  eagles: { score: 640, previousScore: 820, breakdown: { activities: 280, attendance: 240, challenges: 120 } },
}

export const leaderboardMock: Leaderboard = {
  periodLabel: 'Week 1',
  // The logged-in participant's group. Real value comes from their membership,
  // not from the board — which is why it lives here, separate from `groups`.
  currentGroupId: 'wolves',
  groups: CAMP_GROUPS.map((g) => ({ ...g, ...SCORES[g.id] })),
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS, no errors.

- [ ] **Step 4: Manual check — leaderboard unchanged**

Run: `npm run dev`, log in as a participant, open the **Ranks** screen. Expected: same 6 groups, same order (Summit Foxes top), same scores as before. (Data is identical — only its source moved.)

- [ ] **Step 5: Format touched files**

Run: `npx prettier --write --end-of-line auto src/lib/groups.ts src/lib/mockLeaderboard.ts`

- [ ] **Step 6: Checkpoint** (commit only if the user has approved committing)

```bash
git add src/lib/groups.ts src/lib/mockLeaderboard.ts
git commit -m "refactor: add canonical CAMP_GROUPS as single source of group identity"
```

---

### Task 2: Organizer identity store

**Files:**
- Create: `camply-frontend/src/store/useOrganizerStore.ts`

**Interfaces:**
- Consumes: `CampGroup` (Task 1), `OrganizerRole` (from existing `components/organizer/roles.ts`).
- Produces: `useOrganizerStore` with state `{ role: OrganizerRole | null; group: CampGroup | null }` and actions `setIdentity(role: OrganizerRole, group: CampGroup | null): void`, `reset(): void`. Consumed by Task 4.

- [ ] **Step 1: Create `store/useOrganizerStore.ts`**

```ts
import { create } from 'zustand'
import type { OrganizerRole } from '../components/organizer/roles'
import type { CampGroup } from '../lib/groups'

/*
  CLIENT state — the organizer's OWN identity chosen at onboarding: their role,
  and (coordinators only) the single group they run. The organizer twin of
  useProfileStore, kept separate because that store is the participant's profile;
  role/group is organizer-specific. In-memory (not persisted), same as
  useProfileStore. When the backend lands, setIdentity is the seam where the
  organizer-registration mutation fires — nothing else in the UI changes.
*/
type OrganizerState = {
  role: OrganizerRole | null
  group: CampGroup | null
  /** Commit role + group on profile submit. `group` is null for every role
      except coordinator. */
  setIdentity: (role: OrganizerRole, group: CampGroup | null) => void
  /** Wipe on log out. */
  reset: () => void
}

export const useOrganizerStore = create<OrganizerState>((set) => ({
  role: null,
  group: null,
  setIdentity: (role, group) => set({ role, group }),
  reset: () => set({ role: null, group: null }),
}))
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS. (The store is exported but not yet consumed — that's fine; unused *exports* don't trip `noUnusedLocals`.)

- [ ] **Step 3: Format touched file**

Run: `npx prettier --write --end-of-line auto src/store/useOrganizerStore.ts`

- [ ] **Step 4: Checkpoint** (commit only if the user has approved committing)

```bash
git add src/store/useOrganizerStore.ts
git commit -m "feat: add useOrganizerStore for organizer role + group identity"
```

---

### Task 3: i18n keys + GroupPicker component

**Files:**
- Modify: `camply-frontend/src/i18n/translations.ts` (type `OrganizerStrings` + the three `organizer` blocks)
- Create: `camply-frontend/src/components/organizer/GroupPicker.tsx`

**Interfaces:**
- Consumes: `CAMP_GROUPS`, `CampGroup` (Task 1); `t.organizer.groupPlaceholder` (this task).
- Produces: `GroupPicker` component — props `{ value: CampGroup | null; onChange: (group: CampGroup) => void }`; `t.organizer.groupLabel` + `t.organizer.groupPlaceholder`. Consumed by Task 4.

- [ ] **Step 1: Add two keys to the `OrganizerStrings` type**

In `translations.ts`, in `type OrganizerStrings = { ... }`, add after `roleLabel: string`:

```ts
  groupLabel: string // shown only for the coordinator role
  groupPlaceholder: string // collapsed-row prompt in the group picker
```

- [ ] **Step 2: Add the keys to all three `organizer` blocks**

In the **UZ** `organizer` block, after the `roles: { ... },` object add:

```ts
      groupLabel: 'Guruhingiz',
      groupPlaceholder: 'Guruhni tanlang',
```

In the **RU** `organizer` block, after `roles: { ... },` add:

```ts
      groupLabel: 'Ваша группа',
      groupPlaceholder: 'Выберите группу',
```

In the **EN** `organizer` block, after `roles: { ... },` add:

```ts
      groupLabel: 'Your group',
      groupPlaceholder: 'Choose your group',
```

- [ ] **Step 3: Create `components/organizer/GroupPicker.tsx`**

Mirrors `CityPicker`'s field styling (raw-hex classes kept identical to the sibling so the two pickers look the same in the onboarding form), minus the search input.

```tsx
import { useState } from 'react'
import { CAMP_GROUPS, type CampGroup } from '../../lib/groups'
import { useTranslation } from '../../i18n/useTranslation'

type Props = {
  /** The chosen group, or null before the coordinator picks one. */
  value: CampGroup | null
  onChange: (group: CampGroup) => void
}

/*
  Group field for the coordinator role — the sibling of CityPicker, minus the
  search (a camp has ~5–10 groups, so we list them all). Collapsed, it's a
  tappable row showing the chosen group's color + name (or a prompt). Open, it
  drops the full list. The parent owns the selected group; this owns only its
  open state. Reads CAMP_GROUPS statically today — becomes useCampGroups(campId)
  when camp-selection + backend land.
*/
export function GroupPicker({ value, onChange }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const select = (group: CampGroup) => {
    onChange(group)
    setOpen(false)
  }

  return (
    <div>
      {/* Collapsed field */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={[
          'flex min-h-[52px] w-full items-center gap-3 rounded-[16px] bg-[#fffdf8] px-3.5 text-left shadow-[0_3px_10px_rgba(20,40,30,0.04)] transition-shadow',
          open
            ? 'border-[1.5px] border-pine shadow-[0_0_0_4px_rgba(15,107,79,0.12)]'
            : 'border-[1.5px] border-[#e7e1d3]',
        ].join(' ')}
      >
        <span
          aria-hidden
          className="h-4 w-4 flex-none rounded-full"
          style={{ backgroundColor: value ? value.color : '#d8d2c4' }}
        />

        {value ? (
          <span className="flex-1 text-[15px] font-semibold leading-tight text-ink">
            {value.name}
          </span>
        ) : (
          <span className="flex-1 text-[15px] font-medium text-[#a9b0a8]">
            {t.organizer.groupPlaceholder}
          </span>
        )}

        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden
          className="flex-none transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path
            d="M5 7l4 4 4-4"
            stroke="#9aa79f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Expanded list (no search — groups are few) */}
      {open && (
        <div className="animate-drop mt-2 overflow-hidden rounded-[18px] border-[1.5px] border-[#e7e1d3] bg-[#fffdf8] shadow-[0_14px_34px_rgba(20,40,30,0.14)]">
          <div className="max-h-[214px] overflow-y-auto">
            {CAMP_GROUPS.map((group) => {
              const selected = value?.id === group.id
              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => select(group)}
                  className={[
                    'flex w-full items-center gap-2.5 border-b border-[#f4efe4] px-3.5 py-3 text-left',
                    selected ? 'bg-[#f3f8f5]' : 'bg-transparent',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="h-[26px] w-[26px] flex-none rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="flex-1 text-[14px] font-semibold leading-tight text-ink">
                    {group.name}
                  </span>
                  {selected && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path
                        d="M4 9.5l3 3 7-7.5"
                        stroke="#0f6b4f"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS. (If typecheck complains a language is missing `groupLabel`/`groupPlaceholder`, add the missing key — the typed bundle forces all three languages to match.)

- [ ] **Step 5: Format touched files**

Run: `npx prettier --write --end-of-line auto src/i18n/translations.ts src/components/organizer/GroupPicker.tsx`

- [ ] **Step 6: Checkpoint** (commit only if the user has approved committing)

```bash
git add src/i18n/translations.ts src/components/organizer/GroupPicker.tsx
git commit -m "feat: add GroupPicker + group i18n keys for coordinator role"
```

---

### Task 4: Wire GroupPicker into OrganizerInfoForm + ProfileForm onCommit

**Files:**
- Modify: `camply-frontend/src/components/signup/ProfileForm.tsx` (add `onCommit` prop)
- Modify: `camply-frontend/src/components/organizer/OrganizerInfoForm.tsx` (group state + conditional picker + validity + persist)

**Interfaces:**
- Consumes: `GroupPicker`, `t.organizer.groupLabel` (Task 3); `useOrganizerStore.setIdentity` (Task 2); `CampGroup` (Task 1); existing `RolePicker`, `OrganizerRole`, `ProfileForm`.
- Produces: coordinator-gated group selection; organizer identity persisted on submit.

- [ ] **Step 1: Add the `onCommit` seam to `ProfileForm`**

In `ProfileForm.tsx`, add to the `Props` type (near `extraValid`):

```ts
  /** Fired inside submit(), right after the profile commits — the caller's hook
      to persist its own extra fields (e.g. the organizer's role + group). */
  onCommit?: () => void
```

Destructure it in the function signature (add `onCommit,` alongside `extraValid = true,`).

Then in `submit`, call it right after `setRegistration(...)`:

```ts
  const submit = () => {
    if (!valid || !city) return
    setRegistration({ name: trimmedName, surname: trimmedSurname, city, age, photo, initials })
    onCommit?.()
    setSubmitted(true)
  }
```

- [ ] **Step 2: Update `OrganizerInfoForm.tsx` — imports, state, handlers**

Replace the imports/top of the component with:

```tsx
import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { ProfileForm } from '../signup/ProfileForm'
import { ProfileSuccess } from '../signup/ProfileSuccess'
import { RolePicker } from './RolePicker'
import { GroupPicker } from './GroupPicker'
import { type OrganizerRole } from './roles'
import { type CampGroup } from '../../lib/groups'
import { useOrganizerStore } from '../../store/useOrganizerStore'
```

Inside the component body, replace the single `role` state with:

```tsx
  const { t } = useTranslation()
  const [role, setRole] = useState<OrganizerRole | null>(null)
  const [group, setGroup] = useState<CampGroup | null>(null)
  const setIdentity = useOrganizerStore((s) => s.setIdentity)

  const isCoordinator = role === 'coordinator'

  // Picking a non-coordinator role clears any group chosen earlier, so a stale
  // group never gets committed.
  const handleRole = (next: OrganizerRole) => {
    setRole(next)
    if (next !== 'coordinator') setGroup(null)
  }

  // Role required; coordinators also need a group before they can enter.
  const extraValid = Boolean(role) && (!isCoordinator || Boolean(group))
```

- [ ] **Step 3: Update the `ProfileForm` props — `extraValid`, `onCommit`, `extraFields`**

Set `extraValid={extraValid}` and add `onCommit`:

```tsx
      extraValid={extraValid}
      onCommit={() => {
        if (role) setIdentity(role, isCoordinator ? group : null)
      }}
```

Replace `extraFields` with the role picker plus the coordinator-only group picker:

```tsx
      extraFields={
        <>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
            {t.organizer.roleLabel}
          </p>
          <div className="mt-2.5">
            <RolePicker value={role} onChange={handleRole} labels={t.organizer.roles} />
          </div>

          {isCoordinator && (
            <div className="animate-drop">
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
                {t.organizer.groupLabel}
              </p>
              <div className="mt-2.5">
                <GroupPicker value={group} onChange={setGroup} />
              </div>
            </div>
          )}
        </>
      }
```

Leave `renderSuccess` and the `Props` type unchanged.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Manual check — the full flow**

Run: `npm run dev`. At login enter the mock organizer number **`99 999 99 99`** (national digits `999999999`, from `lib/mockOrganizers.ts`) → Continue into the profile form. Verify:
1. Fill name + surname + city. Pick a **non-coordinator** role (e.g. Project Manager) → **no group picker appears**, and the submit button enables ("Create profile").
2. Pick **Coordinator** → the group picker slides in (`animate-drop`) under the role chips, and submit is **disabled** until a group is chosen.
3. Open the picker → 6 groups with color dots, **no search box** → pick one → it collapses showing the choice → submit enables.
4. Switch from Coordinator to another role → group picker disappears; switch back → group is empty again (cleared), submit disabled until re-picked.
5. Repeat in **UZ** and **RU** (language switcher) → `groupLabel` / `groupPlaceholder` are translated; group names stay literal.
6. Submit as a coordinator → success overlay shows. (Persistence into `useOrganizerStore` is confirmed via React DevTools or a temporary `console.log(useOrganizerStore.getState())` — "Enter" itself is still a placeholder this pass.)

- [ ] **Step 6: Format touched files**

Run: `npx prettier --write --end-of-line auto src/components/signup/ProfileForm.tsx src/components/organizer/OrganizerInfoForm.tsx`

- [ ] **Step 7: Checkpoint** (commit only if the user has approved committing)

```bash
git add src/components/signup/ProfileForm.tsx src/components/organizer/OrganizerInfoForm.tsx
git commit -m "feat: coordinator role requires choosing a group at onboarding"
```

---

## Self-Review

**Spec coverage:**
- Single source `lib/groups.ts` → Task 1 ✅
- Leaderboard consolidation → Task 1 ✅
- `useOrganizerStore` (role + group, in-memory) → Task 2 ✅
- No-search `GroupPicker` (CityPicker sibling) → Task 3 ✅
- i18n `groupLabel` / `groupPlaceholder` ×3, names literal → Task 3 ✅
- Coordinator-only rendering + validity gate + clear-on-role-change + `onCommit` persist → Task 4 ✅
- Out of scope (dashboard shell, other mock migrations, `useCampGroups` fetch) → untouched ✅

**Type consistency:** `CampGroup` (id/name/color), `OrganizerRole`, `setIdentity(role, group)`, `GroupPicker` props `{ value, onChange }`, `onCommit?: () => void` — used identically across Tasks 1→4.

**Placeholder scan:** none — every code step shows complete content.
