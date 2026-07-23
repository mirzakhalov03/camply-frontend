# Profile Support + Home Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Support (Telegram) link to all three profile screens, a current-weather chip to the participant camp cover, and cap the "My group" avatar row at 4 + "+N".

**Architecture:** Three independent, additive, **frontend-only** changes. One shared `SupportCard` holds the Telegram URL once; a small `WeatherChip` reuses the existing `useCurrentWeather()` data and owns its own state so `CampCover` stays presentational; the avatar cap is a pure render change in `MyGroupCard`.

**Tech Stack:** React 19 + TypeScript, Tailwind v4 (CSS-first tokens), React Query (existing weather hook), react-router. No new dependencies, no backend.

## Global Constraints

_Every task's requirements implicitly include this section._

- **No test runner** (project preference — CLAUDE.md). Do NOT add tests. The per-change gate is `npm run typecheck`; behavior is confirmed by manual/visual check in `npm run dev`.
- **TypeScript strict-ish:** `verbatimModuleSyntax` + `noUnusedLocals` are on — use `import type { … }` for type-only imports; remove now-unused imports.
- **Design tokens only, no raw hex** — a hardcoded color is a dark-mode bug (`.dark` only redefines token vars). Use `bg-surface`, `text-content`, `text-muted`, `border-line`, `bg-soft`, `border-white/30`, etc. Type scale: `text-meta`(11) `text-body`(13); radii: `rounded-card`(24), `rounded-full`.
- **Trilingual, no hard-coded copy** — every user-facing string ships EN/UZ/RU in `src/i18n/translations.ts`; `tsc` fails until all three languages cover a new key.
- **`@/` alias → `src/`** for new imports (e.g. `@/i18n/useTranslation`).
- **Prettier:** no semicolons, single quotes, trailing commas, width 100, 2-space indent.
- **Commits require the user's explicit permission** (user rule: never commit without being asked). The commit step is written out, but the executor must get a "yes" before running it. The stray uncommitted `vite.config.ts` (unrelated chat-proxy work) must NOT be included in any commit here — stage only the files each task lists.
- Commit messages end with the trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Cap "My group" avatars at 4 + "+N"

Fixes the reported bug: an 8-member group renders 8 overlapping avatars that overflow the row and collide with the floating SOS button. Cap the *render* at 4 (data is unchanged) and append a neutral "+N" counter.

**Files:**
- Modify: `src/components/participant/home/MyGroupCard.tsx` (the avatar-row `<div className="flex">…</div>`, currently lines ~46–58)

**Interfaces:**
- Consumes: `group.members` (array of `{ initials, color }`) and `group.memberCount` (number) — both already on the `CampHome['group']` type this component receives.
- Produces: nothing consumed by other tasks.

- [ ] **Step 1: Add the cap constant + derived values**

Place these **after** the `if (!group) { return … }` early-return (so `group` is
narrowed to non-null and needs no optional chaining) and before the final `return (`.
Add:

```tsx
  // Show at most 4 avatars; the rest collapse into a "+N" counter so the row
  // never overflows into the floating SOS button. Data is unchanged — this is
  // purely how many we render.
  const MAX_AVATARS = 4
  const visibleMembers = group.members.slice(0, MAX_AVATARS)
  const overflow = group.memberCount - visibleMembers.length
```

- [ ] **Step 2: Replace the avatar-row render**

Replace this block:

```tsx
      <div className="flex">
        {group.members.map((m, i) => (
          <span
            key={m.initials}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-surface text-[13px] font-bold text-white ${
              i > 0 ? '-ml-3.5' : ''
            }`}
            style={{ backgroundColor: m.color }}
          >
            {m.initials}
          </span>
        ))}
      </div>
```

with:

```tsx
      <div className="flex">
        {visibleMembers.map((m, i) => (
          <span
            key={m.initials}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-surface text-[13px] font-bold text-white ${
              i > 0 ? '-ml-3.5' : ''
            }`}
            style={{ backgroundColor: m.color }}
          >
            {m.initials}
          </span>
        ))}
        {overflow > 0 && (
          <span className="-ml-3.5 flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-surface bg-soft text-[13px] font-bold text-muted">
            +{overflow}
          </span>
        )}
      </div>
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 4: Manual verify**

Run `npm run dev`, open `/camp/home` (participant). Confirm: the "My group" card shows at most 4 colored avatars followed by a `+N` circle (e.g. an 8-member group → 4 + `+4`); the row no longer overflows or overlaps the SOS button; the group name stays on one line. A group of ≤4 shows no counter. Check both light and dark mode (dark toggle on the cover).

- [ ] **Step 5: Commit** _(only after user says yes)_

```bash
git add src/components/participant/home/MyGroupCard.tsx
git commit -m "$(cat <<'EOF'
fix(home): cap My Group avatars at 4 with +N overflow

An 8-member group rendered 8 overlapping avatars that overflowed the row
and collided with the floating SOS button. Render at most 4 + a neutral
"+N" counter; data is unchanged.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Current-weather chip on the participant camp cover

Reuse the existing `useCurrentWeather()` data. Extract the shared condition→glyph map so it isn't duplicated, add a self-contained `WeatherChip` that owns its own data (keeping `CampCover` presentational), and place it top-left of the cover.

**Files:**
- Modify: `src/api/services/weather.service.ts` (export a shared `CONDITION_GLYPH`)
- Modify: `src/components/organizer/camps/WeatherTile.tsx` (use the shared map instead of its local copy)
- Create: `src/components/participant/home/WeatherChip.tsx`
- Modify: `src/components/participant/home/CampCover.tsx` (render `<WeatherChip />` top-left)

**Interfaces:**
- Consumes: `useCurrentWeather()` from `@/api/queries/weather.queries` → `{ data?: { tempC: number; condition: WeatherCondition; fetchedAt: string } }`; `WeatherCondition` from `@/api/services/weather.service`.
- Produces: `CONDITION_GLYPH: Record<WeatherCondition, string>` (exported from `weather.service.ts`); `WeatherChip` (default-styled, no props).

- [ ] **Step 1: Export the shared glyph map from the weather service**

In `src/api/services/weather.service.ts`, immediately after the `WeatherCondition` type export (the `export type WeatherCondition = …` line), add:

```tsx
/*
  Coarse condition → glyph. A status hint, not a forecast. Exported so the organizer
  WeatherTile and the participant cover chip share one map instead of each keeping a copy.
  Plain data (no React), so it belongs with the condition enum it maps from.
*/
export const CONDITION_GLYPH: Record<WeatherCondition, string> = {
  clear: '☀️',
  clouds: '☁️',
  rain: '🌧️',
  snow: '❄️',
  storm: '⛈️',
  fog: '🌫️',
}
```

- [ ] **Step 2: Point WeatherTile at the shared map**

In `src/components/organizer/camps/WeatherTile.tsx`, replace the top imports:

```tsx
import { useCurrentWeather } from '../../../api/queries/weather.queries'
import type { WeatherCondition } from '../../../api/services/weather.service'
import { Skeleton } from '../../ui'
```

with:

```tsx
import { useCurrentWeather } from '../../../api/queries/weather.queries'
import { CONDITION_GLYPH } from '../../../api/services/weather.service'
import { Skeleton } from '../../ui'
```

Then delete the now-duplicated local declaration (the comment block plus):

```tsx
const CONDITION_GLYPH: Record<WeatherCondition, string> = {
  clear: '☀️',
  clouds: '☁️',
  rain: '🌧️',
  snow: '❄️',
  storm: '⛈️',
  fog: '🌫️',
}
```

The rest of `WeatherTile` (which uses `CONDITION_GLYPH[data.condition]`) is unchanged. Removing the `WeatherCondition` type import is required — `verbatimModuleSyntax`/`noUnusedLocals` would otherwise error.

- [ ] **Step 3: Create the WeatherChip component**

Create `src/components/participant/home/WeatherChip.tsx`:

```tsx
import { useCurrentWeather } from '@/api/queries/weather.queries'
import { CONDITION_GLYPH } from '@/api/services/weather.service'

/*
  Current-weather chip for the camp cover. Owns its own data (useCurrentWeather →
  device location + Open-Meteo) so CampCover stays purely presentational. Weather is
  external and may be slow, denied, or offline; the chip degrades to NOTHING — it
  renders only once data exists, never a skeleton or a "—°" dash (a dash reads as
  broken over a hero photo). Styled to match the cover's other floating glass controls.
*/
export function WeatherChip() {
  const { data } = useCurrentWeather()
  if (!data) return null

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-white shadow-md backdrop-blur-md">
      <span className="text-[13px] font-bold leading-none">{Math.round(data.tempC)}°</span>
      <span className="text-[13px] leading-none">{CONDITION_GLYPH[data.condition]}</span>
    </div>
  )
}
```

- [ ] **Step 4: Render the chip top-left of the cover**

In `src/components/participant/home/CampCover.tsx`, add the import near the top (after the existing imports):

```tsx
import { WeatherChip } from './WeatherChip'
```

Then, inside the root cover `<div>`, immediately after the scrim div (the line ending `…rgba(8,40,28,0.85)_100%)]" />`) and before the `{/* Floating controls… */}` block, add:

```tsx
      {/* Weather chip — top-left, mirroring the bell + theme controls top-right.
          Owns its own data so this component stays presentational. */}
      <div className="absolute left-4 top-4 z-10">
        <WeatherChip />
      </div>
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Manual verify**

Run `npm run dev`, open `/camp/home`. Allow location when the browser prompts. Confirm: a glass chip like `24° ☀️` sits top-left of the cover, matching the top-right controls; it reads in both light and dark mode. Then test degradation: block/deny location (or go offline) and reload — the cover still renders cleanly and the chip is simply absent (no dash, no error). Re-check the organizer weather tile at `/org/camps` still shows its temp + glyph (shared map didn't break it).

- [ ] **Step 7: Commit** _(only after user says yes)_

```bash
git add src/api/services/weather.service.ts src/components/organizer/camps/WeatherTile.tsx src/components/participant/home/WeatherChip.tsx src/components/participant/home/CampCover.tsx
git commit -m "$(cat <<'EOF'
feat(home): current-weather chip on participant camp cover

Reuses the existing useCurrentWeather() data (device location + Open-Meteo).
WeatherChip owns its own data so CampCover stays presentational, and renders
only when data is available. Extracts the shared CONDITION_GLYPH map so the
organizer tile and the cover chip no longer duplicate it.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Support (Telegram) link on all three profiles

One shared `SupportCard` (URL + copy in a single place), dropped in above logout on the participant, organizer, and organization profile screens. New i18n keys in all three languages.

**Files:**
- Create: `src/components/ui/SupportCard.tsx`
- Modify: `src/components/ui/index.ts` (export it from the barrel)
- Modify: `src/i18n/translations.ts` (add `support` + `supportSubtitle` to `ProfileStrings` and all three language `profile` blocks)
- Modify: `src/components/participant/profile/ProfileScreen.tsx`
- Modify: `src/components/organizer/profile/OrgProfileScreen.tsx`
- Modify: `src/components/organization/profile/AdminProfileScreen.tsx`

**Interfaces:**
- Consumes: `useTranslation()` → `t.profile.support`, `t.profile.supportSubtitle`.
- Produces: `SupportCard` (no props), exported from `@/components/ui`.

- [ ] **Step 1: Add the i18n keys to the type**

In `src/i18n/translations.ts`, in the `ProfileStrings` interface, add two fields right after `logout: string` (the last field before the closing `}` of the interface, in the `// Settings` group area):

```tsx
  support: string
  supportSubtitle: string
```

(This makes `tsc` fail until every language supplies both — your safety net for trilingual coverage.)

- [ ] **Step 2: Add the keys to all three language `profile` blocks**

In the same file, in each language object's `profile: { … }` block, add the two keys after that block's `logout:` line. Use these exact values:

EN `profile`:

```tsx
      support: 'Support',
      supportSubtitle: 'Contact us on Telegram',
```

UZ `profile`:

```tsx
      support: 'Yordam',
      supportSubtitle: 'Telegram orqali bogʻlaning',
```

RU `profile`:

```tsx
      support: 'Поддержка',
      supportSubtitle: 'Напишите нам в Telegram',
```

- [ ] **Step 3: Create the SupportCard component**

Create `src/components/ui/SupportCard.tsx`:

```tsx
import { useTranslation } from '@/i18n/useTranslation'

/*
  Support entry shown on every profile (participant, organizer, organization). A plain
  external link to the Camply team's Telegram — no backend, no handler. The URL lives
  here ONCE so all three surfaces share a single source of truth; changing the handle
  (or later swapping Telegram for an in-app flow) is a one-file edit. Styled to match
  the surface cards on the profile screens.
*/
const SUPPORT_URL = 'https://t.me/camplyadmin'

export function SupportCard() {
  const { t } = useTranslation()

  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-[0_4px_14px_rgba(20,40,30,0.05)] transition active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sky/15 text-base">
        💬
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-body font-semibold text-content">{t.profile.support}</div>
        <div className="truncate text-meta text-muted">{t.profile.supportSubtitle}</div>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-none text-line"
        aria-hidden
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </a>
  )
}
```

- [ ] **Step 4: Export it from the ui barrel**

In `src/components/ui/index.ts`, add after the other exports:

```tsx
export { SupportCard } from './SupportCard'
```

- [ ] **Step 5: Add SupportCard to the participant profile**

In `src/components/participant/profile/ProfileScreen.tsx`, add to the existing `ui` import — the file currently does not import from `ui`, so add a new import line with the other imports:

```tsx
import { SupportCard } from '../../ui'
```

Then place it after `<SettingsList />` and before the logout `<button>`:

```tsx
        <SettingsList />
        <SupportCard />
        <button
          type="button"
          onClick={logout}
          className="p-1 text-center text-body font-bold text-danger"
        >
          {t.profile.logout}
        </button>
```

- [ ] **Step 6: Add SupportCard to the organizer profile**

In `src/components/organizer/profile/OrgProfileScreen.tsx`, extend the existing ui import:

```tsx
import { Avatar, SupportCard } from '../../ui'
```

Then place `<SupportCard />` after the Settings card `</div>` and before the logout `<button>`:

```tsx
        </div>

        <SupportCard />

        <button
          type="button"
          onClick={logout}
          className="py-1 text-center text-body font-bold text-danger-deep active:scale-[0.99]"
        >
          {t.profile.logout}
        </button>
```

- [ ] **Step 7: Add SupportCard to the organization profile**

In `src/components/organization/profile/AdminProfileScreen.tsx`, extend the existing ui import:

```tsx
import { Badge, SupportCard } from '../../ui'
```

Then place `<SupportCard />` after the Settings card `</div>` and before the logout `<button>`:

```tsx
        </div>

        <SupportCard />

        <button
          type="button"
          onClick={logout}
          className="py-1 text-center text-body font-bold text-danger-deep active:scale-[0.99]"
        >
          {p.logout}
        </button>
```

- [ ] **Step 8: Typecheck**

Run: `npm run typecheck`
Expected: PASS. (If it complains a language is missing `support`/`supportSubtitle`, that language's `profile` block wasn't updated in Step 2 — fix it.)

- [ ] **Step 9: Manual verify**

Run `npm run dev`. On each of the three profiles — participant `/camp/profile`, organizer `/org/profile`, organization `/admin/profile` — confirm a "Support" card sits directly above Log out, with the subtitle, and matches the surrounding cards in light and dark mode. Tapping it opens `https://t.me/camplyadmin` in a new tab. Switch language (UZ/RU/EN) and confirm the copy translates.

- [ ] **Step 10: Commit** _(only after user says yes)_

```bash
git add src/components/ui/SupportCard.tsx src/components/ui/index.ts src/i18n/translations.ts src/components/participant/profile/ProfileScreen.tsx src/components/organizer/profile/OrgProfileScreen.tsx src/components/organization/profile/AdminProfileScreen.tsx
git commit -m "$(cat <<'EOF'
feat(profile): Support link to Camply Telegram on all profiles

One shared SupportCard (URL + copy in a single place) above logout on the
participant, organizer, and organization profiles. Opens t.me/camplyadmin.
Trilingual copy added (EN/UZ/RU).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Final verification (after all tasks)

- [ ] Run `npm run typecheck` — PASS.
- [ ] Run `npm run lint` (oxlint) — no new errors.
- [ ] Format only the touched files, preserving line endings: `npx prettier --write --end-of-line auto <files you changed>`. (Do NOT run `format` across the tree — it rewrites 80+ files' line endings on Windows checkouts.)
- [ ] Manual smoke of all three: participant home (weather chip + capped avatars), and all three profiles (Support card).

## Notes on decisions (for the reviewer)

- **`SupportCard` in `ui/`**: it's used by all three surfaces, so a surface-specific folder would force cross-surface imports (e.g. admin → participant). Treating it as a shared building block in `ui/` is the least-coupled home, even though it's slightly more composed than the pure primitives beside it.
- **`WeatherChip` owns its data**: mirrors how the organizer `WeatherTile` works and keeps `CampCover` presentational (its own comment promises it "renders whatever `camp` it's handed").
- **Shared `CONDITION_GLYPH`**: co-located with the `WeatherCondition` enum it maps from; DRY across the two consumers.
- **Avatar cap is client-side only**: the card's data still contains all members; we just render fewer. Sufficient at camp scale; a server-side cap can come later if needed.
