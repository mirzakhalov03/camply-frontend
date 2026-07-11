# Organizer Onboarding — Coordinator Group Selection

**Date:** 2026-07-09
**Surface:** Organizer (onboarding step 2 — the organizer profile form)
**Scope:** Onboarding change only. No dashboard shell in this pass — "Enter" stays a
placeholder route as it is today.

---

## Problem

Two things:

1. **Feature.** When an organizer fills in their info and selects the **coordinator**
   role, they must also choose exactly one **group** (Pine Wolves, River Hawks…). A
   coordinator coordinates a single group, so we capture which one at signup. Every
   other role fills the form and enters directly; a coordinator picks a group first.

2. **Architecture gap it exposes.** Today `OrganizerInfoForm` keeps the chosen `role`
   in local `useState` and **drops it on submit** — organizer identity is never
   persisted anywhere. Adding `group` on top of a role that already goes nowhere is
   the moment to give organizer identity a real home. This is the "strong
   architecture from now" the work is meant to establish.

---

## Design

### 1. Single source for group names — `lib/groups.ts` (new)

Group names are currently duplicated as magic strings across `mockLeaderboard.ts`,
`mockChat.ts`, `mockCamp.ts`, `mockMembership.ts`, `mockAnnouncements.ts`,
`mockSchedule.ts`. The new picker must not add a seventh copy.

Create the canonical list:

```ts
export type CampGroup = {
  id: string      // stable key, e.g. 'wolves'
  name: string    // proper noun — literal in every language, NOT i18n
  color: string   // brand-palette hex for the swatch
}

export const CAMP_GROUPS: CampGroup[] = [ /* the 6 groups */ ]
```

- **Static export, read directly by the form** — mirrors `lib/cities.ts` / `CityPicker`.
  No React Query / loading state mid-onboarding.
- A comment marks the future seam: when camp-selection + backend land this becomes a
  camp-scoped `useCampGroups(campId)` fetch. Groups are ultimately camp server data.
- **Group names stay literal (not i18n)** — same decision as cities: proper nouns
  don't translate.

**Consolidation:** `mockLeaderboard.ts` is refactored to source each group's identity
(`id` / `name` / `color`) from `CAMP_GROUPS`, keeping only its own leaderboard-specific
fields (`score`, `previousScore`, `breakdown`). Result: exactly one place defines group
identity; no drift. Leaderboard ordering (by score) is unaffected — it derives its own
order. Other mock files are left as-is this pass (out of scope), but new group-selection
UI reads only `CAMP_GROUPS`.

### 2. Organizer identity store — `store/useOrganizerStore.ts` (new)

The organizer twin of `useProfileStore`. Client-owned, **in-memory (not persisted)** —
matching `useProfileStore` exactly.

```ts
type OrganizerState = {
  role: OrganizerRole | null
  group: CampGroup | null
  setRole: (role: OrganizerRole) => void
  setGroup: (group: CampGroup | null) => void
  reset: () => void
}
```

- Lives separate from `useProfileStore` because that store is documented as "the
  participant's OWN profile" — role/group is organizer-specific identity, not profile.
- When the backend lands, its setters become part of the organizer registration call
  (the single place a mutation fires), same pattern the profile store follows.

### 3. `GroupPicker` — `components/organizer/GroupPicker.tsx` (new)

Modeled on `CityPicker`, **without the search input** (groups are ~5–10, all shown):

- Collapsed: a tappable row showing a color dot + the chosen group name, or a
  placeholder prompt.
- Open: `animate-drop` panel listing every `CAMP_GROUPS` entry (color swatch + name),
  single-select, closes on pick.
- Controlled — the parent owns the selected `CampGroup`.
- Same field styling/tokens as `CityPicker` (pine focus ring, `rounded-input`, etc.).

### 4. Wiring — `OrganizerInfoForm.tsx` + one new `ProfileForm` seam

- Render `<GroupPicker>` inside the existing `extraFields` slot, **only when
  `role === 'coordinator'`**, appearing with `animate-drop` under the role chips.
- **Validity gate** (`extraValid`):
  `role !== null && (role !== 'coordinator' || group !== null)`.
  Coordinators can't submit without a group; every other role submits on role alone.
- Switching the role away from `coordinator` **clears** the selected group (no stale
  value carried into the store).
- `ProfileForm` gains one optional prop **`onCommit?: () => void`**, called inside its
  existing `submit()` right after `setRegistration(...)`. `OrganizerInfoForm` uses it to
  write `role` (+ `group` for coordinators) into `useOrganizerStore` at the same instant
  the profile commits. Parallels the existing `extraFields` / `extraValid` seams — keeps
  `ProfileForm` generic, keeps organizer specifics in `OrganizerInfoForm`.

### 5. i18n — `i18n/translations.ts`

New keys under `t.organizer`, all three languages (UZ / RU / EN):

- `groupLabel` — the field label ("Your group" / «Guruhingiz» / «Ваша группа»)
- `groupPlaceholder` — collapsed-row prompt ("Choose your group")

Group names themselves are literal, not keys.

---

## Files

| File | Change |
|------|--------|
| `lib/groups.ts` | **new** — `CampGroup` type + `CAMP_GROUPS` |
| `store/useOrganizerStore.ts` | **new** — role + group client state |
| `components/organizer/GroupPicker.tsx` | **new** — no-search group picker |
| `components/organizer/OrganizerInfoForm.tsx` | conditional GroupPicker + validity + `onCommit` |
| `components/signup/ProfileForm.tsx` | one optional `onCommit` prop |
| `i18n/translations.ts` | `t.organizer.groupLabel`, `groupPlaceholder` (×3 langs) |
| `lib/mockLeaderboard.ts` | source group identity from `CAMP_GROUPS` |

## Out of scope (this pass)

- Organizer dashboard shell / `/org` route — "Enter" stays a placeholder.
- Migrating the other mock files off duplicated group strings.
- The camp-scoped `useCampGroups(campId)` fetch (marked as a future seam only).
- Persisting organizer identity across reload (matches `useProfileStore`, which doesn't).

## Non-goals / guardrails honored

- Trilingual by default — no hard-coded copy (names excepted, as proper nouns).
- Design-system tokens only — reuse CityPicker's styling, no rogue colors.
- No new state library; Zustand for client state, matching existing stores.
