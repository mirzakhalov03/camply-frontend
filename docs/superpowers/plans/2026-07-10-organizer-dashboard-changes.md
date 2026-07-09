# Organizer Dashboard Changes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the organizer surface into a single-camp home, add a schedule day-switcher, a points scroll-wheel, and bring org chat to participant-chat parity.

**Architecture:** Frontend-only. Three of four slices reuse existing participant components (`DaySelector`, `ChatHeader`, the `Sheet` primitive, the `useAdjustGroupPoints` mutation). Net-new code is concentrated in the points wheel. All data stays on the existing mock/`lib`+`api` seams.

**Tech Stack:** React 19, Vite, Tailwind v4 (CSS-first tokens), Zustand, React Query, react-router 7.

## Global Constraints

- **No test runner** — this repo has none by policy (`frontend/CLAUDE.md`). Do NOT add tests. Each task's verification is: `npm run validate` (oxlint + prettier check + tsc) passing, plus a visual check in `npm run dev`.
- **Trilingual, no hard-coded copy** — every new string ships EN/UZ/RU in `src/i18n/translations.ts` (add to the type interface AND all three language objects).
- **Tokens, not raw hex** — brand/semantic tokens only; dark mode must keep working (`.dark` redefines tokens).
- **Type-only imports** use `import type { … }` (`verbatimModuleSyntax` is on).
- **No semicolons, single quotes, width 100** (Prettier). Format only touched files, preserving endings: `npx prettier --write --end-of-line auto <files>`.
- **Commit** after each task (do NOT push — user rule: no git without explicit permission).

---

### Task 1 (Slice A): Single-camp home

**Files:**
- Modify: `src/components/organizer/orgContext.ts` (swap `openCreate` → `openChat`)
- Modify: `src/components/organizer/OrganizerShell.tsx:36-47` (ctx object)
- Modify: `src/components/organizer/camps/CampsScreen.tsx` (header button, collapse grid to one card)
- Modify: `src/components/organizer/camps/StatStrip.tsx` (On-site tile + unread-aware… no, just tile)
- Modify: `src/App.tsx:59` (delete `/org/camps/new` route)
- Modify: `src/i18n/translations.ts` (add `org.camps.statOnSite`, `org.camps.openChatAria`; the `statActiveCamps`, `newCamp`, `newCampBody`, `campsLabel` keys become unused — leave them, removing keys is a separate cleanup)

**Interfaces:**
- Produces: `OrgContext.openChat: () => void` (replaces `openCreate`)
- Consumes: `OrganizerSummary.onSite: number`, `OrganizerSummary.unreadChat: number` (already exist on the type)

- [ ] **Step 1: Swap the context capability.** In `orgContext.ts`, replace the `openCreate` member with `openChat`:

```ts
  /** Open the organizer Chat tab. */
  openChat: () => void
```

- [ ] **Step 2: Wire it in the shell.** In `OrganizerShell.tsx`, replace the `openCreate` line in `ctx` with:

```ts
    openChat: () => navigate('/org/chat'),
```

- [ ] **Step 3: Header → chat button + camp name.** In `CampsScreen.tsx`: pull `openChat` from `useOrg()` (remove `openCreate`). Replace the header's `<h1>` + `<button>` block (lines ~64-74) so the title is the camp name and the top-right is a chat button with the unread badge:

```tsx
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-display font-bold text-content">{primary?.name ?? c.yourCamps}</h1>
          <button
            type="button"
            onClick={openChat}
            aria-label={c.openChatAria}
            className="relative flex h-[42px] w-[42px] flex-none items-center justify-center rounded-input border border-line bg-surface text-pine shadow-[0_3px_12px_rgba(20,40,30,0.05)] active:scale-95"
          >
            <ChatIcon />
            {summary.unreadChat > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-canvas bg-amber px-1 text-[9px] font-extrabold text-amber-ink">
                {summary.unreadChat}
              </span>
            ) : null}
          </button>
        </div>
```

Add a `ChatIcon` local component (message-bubble svg, `stroke="currentColor"`, matching the prototype line 721 path `M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z`). Remove the old `PlusIcon`.

- [ ] **Step 4: Collapse the camps grid to one card.** In `CampsScreen.tsx`, delete the `campsLabel` `<h2>` and the `camps.length === 0 ? … : (grid.map)` block (lines ~101-112). Replace with a single card for the primary camp:

```tsx
      {primary ? <CampCard camp={primary} onOpen={() => openCamp(primary.id)} /> : null}
```

Keep the stat strip, `HelpBanner`, and the QuickLinks/StandingsWidget grid above it unchanged. Remove the now-unused `EmptyState` local component.

- [ ] **Step 5: On-site stat tile.** In `StatStrip.tsx`, replace the middle tile:

```tsx
      <Tile value={summary.onSite} label={c.statOnSite} />
```

(was `summary.activeCamps` / `c.statActiveCamps`).

- [ ] **Step 6: Delete the create-camp route.** In `App.tsx`, remove the line `<Route path="camps/new" element={<OrgComingSoon />} />` and, if `OrgComingSoon` is now unused, remove its import. (It is still used by the `map` tab route, so keep the import.)

- [ ] **Step 7: Add strings.** In `translations.ts`, add to the `org.camps` interface and all three language objects:

```
statOnSite:   EN 'On-site'   UZ 'Hozir shu yerda'  RU 'На месте'
openChatAria: EN 'Open chat' UZ 'Chatni ochish'    RU 'Открыть чат'
```

- [ ] **Step 8: Validate.** Run: `npm run validate` — Expected: PASS (no lint/format/type errors). Fix any unused-import/var errors from the deletions.

- [ ] **Step 9: Visual check.** `npm run dev`, open `/org`. Expect: one camp card, stat strip reads Participants · On-site · Groups, top-right chat button (with badge) navigates to `/org/chat`, no "New camp" button, `/org/camps/new` redirects home.

- [ ] **Step 10: Commit.**

```bash
git add -A && git commit -m "feat(org): single-camp home with chat shortcut"
```

---

### Task 2 (Slice B): Schedule day-switcher

**Files:**
- Modify: `src/components/organizer/detail/schedule/ScheduleTab.tsx`
- Reuse (no change): `src/components/participant/schedule/DaySelector.tsx`, `groupIntoDays` from `schedule.service.ts`

**Interfaces:**
- Consumes: `DaySelector({ days: ScheduleDay[], selectedKey: string, onSelect: (key: string) => void })`; `groupIntoDays(activities): ScheduleDay[]` where `ScheduleDay = { key, date, isToday, activities }`.

- [ ] **Step 1: Add day state + selector.** Rewrite `ScheduleTab.tsx`'s success branch to compute days once, hold a selected key, and render the selector + only the selected day. Full component body:

```tsx
export function ScheduleTab() {
  const { camp } = useCampDetail()
  const { t } = useTranslation()
  const d = t.org.detail
  const [addOpen, setAddOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { data, isPending, isError } = useSchedule(camp.id)

  const days = data ? groupIntoDays(data) : []
  // Default selection: today if present, else the first day with activities.
  const activeKey = selectedKey ?? days.find((x) => x.isToday)?.key ?? days[0]?.key ?? ''
  const selectedDay = days.find((x) => x.key === activeKey)

  return (
    <div className="flex flex-col gap-4 pt-1">
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="flex items-center justify-center gap-2 rounded-input bg-pine py-3 text-body font-bold text-white shadow-[0_6px_16px_rgba(15,107,79,0.22)] active:scale-[0.99]"
      >
        <PlusIcon />
        {d.addActivity}
      </button>

      {isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40" tone="surface" />
          <Skeleton className="h-28" tone="surface" />
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-body text-muted">{d.loadError}</p>
      ) : days.length === 0 ? (
        <p className="py-8 text-center text-body text-muted">{d.schedEmpty}</p>
      ) : (
        <>
          <DaySelector days={days} selectedKey={activeKey} onSelect={setSelectedKey} />
          {selectedDay ? (
            <div className="rounded-card border border-line bg-surface px-4 shadow-[0_3px_12px_rgba(20,40,30,0.04)]">
              {selectedDay.activities.map((a, i) => (
                <OrgActivityRow
                  key={a.id}
                  activity={a}
                  last={i === selectedDay.activities.length - 1}
                />
              ))}
            </div>
          ) : null}
        </>
      )}

      <AddActivitySheet open={addOpen} onClose={() => setAddOpen(false)} campId={camp.id} />
    </div>
  )
}
```

Update imports: add `import { DaySelector } from '../../../participant/schedule/DaySelector'`; remove the now-unused `dayBucketLabel` and `dayLabels` (and its `t.announcements` refs). Keep `PlusIcon`.

- [ ] **Step 2: Validate.** Run: `npm run validate` — Expected: PASS.

- [ ] **Step 3: Visual check.** Open `/org/camps/:id/schedule`. Expect: a day-chip strip (today highlighted, auto-centered), only the selected day's rows below, tapping a chip switches days, "Add activity" still works.

- [ ] **Step 4: Commit.**

```bash
git add -A && git commit -m "feat(org): schedule day-switcher reusing participant DaySelector"
```

---

### Task 3 (Slice D): Org chat group photo + parity

**Files:**
- Modify: `src/components/organizer/chat/OrgChatScreen.tsx` (group channel header → photo uploader)
- Reuse: `useGroupStore` (`photo`, `setPhoto`)
- Modify: `src/i18n/translations.ts` if a new aria string is needed (reuse `t.chat.changePhoto` — it already exists, EN/UZ/RU)

**Interfaces:**
- Consumes: `useGroupStore((s) => s.photo)`, `useGroupStore((s) => s.setPhoto)` where `setPhoto: (file: File) => void`; existing `t.chat.changePhoto`.

- [ ] **Step 1: Add a photo uploader to the group channel header.** In `OrgChatScreen.tsx`, import the group store and a ref:

```tsx
import { useRef } from 'react' // merge into the existing react import
import { useGroupStore } from '../../../store/useGroupStore'
```

Add inside the component:

```tsx
  const groupPhoto = useGroupStore((s) => s.photo)
  const setGroupPhoto = useGroupStore((s) => s.setPhoto)
  const photoInput = useRef<HTMLInputElement>(null)
  // Only the coordinator's own group has an identity photo; the organizers team keeps its emoji.
  const canUploadPhoto = channel === 'group' && !locked
```

- [ ] **Step 2: Replace the static emoji tile.** In the header, swap the emoji `<span>` (lines ~60-62) for a tile that, on the group channel, is a photo-upload button (mirrors participant `ChatHeader`); on the organizers channel, stays the plain emoji tile:

```tsx
          {canUploadPhoto ? (
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              aria-label={t.chat.changePhoto}
              className="relative flex-none rounded-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-input bg-gradient-to-br from-pine-light to-pine text-xl shadow-[0_4px_10px_rgba(15,107,79,0.25)]">
                {groupPhoto ? (
                  <img src={groupPhoto} alt={title} className="h-full w-full object-cover" />
                ) : (
                  active.emoji
                )}
              </span>
              <span className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-surface-2 bg-pine">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          ) : (
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-input bg-gradient-to-br from-pine-light to-pine text-xl shadow-[0_4px_10px_rgba(15,107,79,0.25)]">
              {active.emoji}
            </span>
          )}
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setGroupPhoto(file)
              e.target.value = ''
            }}
            className="hidden"
            aria-hidden
          />
```

- [ ] **Step 3: Validate.** Run: `npm run validate` — Expected: PASS.

- [ ] **Step 4: Visual check.** Open `/org/chat`. On "Mening guruhim" (as a coordinator role — set via onboarding), the group tile shows a `+` badge and opens a file picker; uploading replaces the emoji and the same photo appears on the participant Ranks/chat (shared `useGroupStore`). On "Tashkilotchilar", the tile is a plain emoji (no uploader). Locked group (non-coordinator) shows no uploader.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat(org): group photo upload in org chat (parity with participant chat)"
```

---

### Task 4 (Slice C): Points scroll-wheel

**Files:**
- Create: `src/components/organizer/detail/leaderboard/PointsWheel.tsx` (the wheel control)
- Create: `src/components/organizer/detail/leaderboard/PointsWheelSheet.tsx` (Sheet wrapper + Apply)
- Modify: `src/components/organizer/detail/leaderboard/OrgLeaderboardRow.tsx` (row → tap target, drop ±25 buttons)
- Modify: `src/components/organizer/detail/leaderboard/LeaderboardTab.tsx` (own the sheet state)
- Modify: `src/i18n/translations.ts` (`org.detail.awardTitle`, `org.detail.applyPoints`, `org.detail.wheelAria`, `org.detail.noChange`)

**Interfaces:**
- Consumes: `useAdjustGroupPoints().mutate({ groupId: string, delta: number })`; `RankedGroup` (`id`, `name`, `initials`, `color`, `photo`, `score`).
- Produces: `PointsWheel({ value: number, onChange: (v: number) => void })`; `PointsWheelSheet({ group: RankedGroup | null, onClose: () => void, onApply: (delta: number) => void })`.

- [ ] **Step 1: Build the wheel.** Create `PointsWheel.tsx`. Values `-25..+25` step 5 (11 stops). CSS scroll-snap; the centered snapped item is the value. `Intl`-free, no physics lib.

```tsx
import { useEffect, useRef } from 'react'

const STEP = 5
const MAX = 25
// [25, 20, … 0 … -20, -25] — positive at the TOP so scrolling up = more points.
const VALUES = Array.from({ length: (MAX * 2) / STEP + 1 }, (_, i) => MAX - i * STEP)
const ITEM_H = 40 // px per row; center slot is one item tall

export function PointsWheel({
  value,
  onChange,
  ariaLabel,
}: {
  value: number
  onChange: (v: number) => void
  ariaLabel: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Center the current value on mount (no smooth scroll — instant position).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const idx = VALUES.indexOf(value)
    el.scrollTop = idx * ITEM_H
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const idx = Math.round(el.scrollTop / ITEM_H)
    const next = VALUES[Math.max(0, Math.min(idx, VALUES.length - 1))]
    if (next !== value) onChange(next)
  }

  return (
    <div
      className="relative mx-auto h-[200px] w-40 overflow-hidden"
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={-MAX}
      aria-valuemax={MAX}
    >
      {/* center highlight band */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 rounded-input border-y border-line bg-soft" />
      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingBlock: '80px' }}
      >
        {/* 80px top/bottom padding = (200/2 - 40/2) so first/last value can center */}
        <div style={{ height: 80 }} />
        {VALUES.map((v) => (
          <div
            key={v}
            className={`flex h-10 snap-center items-center justify-center text-heading font-extrabold tabular-nums transition ${
              v === value ? 'text-pine' : 'text-muted/50'
            }`}
          >
            {v > 0 ? `+${v}` : v}
          </div>
        ))}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build the sheet.** Create `PointsWheelSheet.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { Sheet, Avatar } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { interpolate } from '../../../../lib/interpolate'
import type { RankedGroup } from '../../../../lib/leaderboard'
import { PointsWheel } from './PointsWheel'

export function PointsWheelSheet({
  group,
  onClose,
  onApply,
}: {
  group: RankedGroup | null
  onClose: () => void
  onApply: (delta: number) => void
}) {
  const { t } = useTranslation()
  const d = t.org.detail
  const [delta, setDelta] = useState(0)

  // Reset the wheel to 0 each time a new group opens the sheet.
  useEffect(() => {
    if (group) setDelta(0)
  }, [group])

  return (
    <Sheet
      open={group !== null}
      onClose={onClose}
      closeLabel={d.wheelAria}
      title={
        group ? (
          <span className="flex items-center gap-2.5">
            <Avatar
              name={group.name}
              initials={group.initials}
              color={group.color}
              photo={group.photo}
              size="sm"
            />
            {group.name} · {group.score}
          </span>
        ) : null
      }
    >
      <PointsWheel value={delta} onChange={setDelta} ariaLabel={d.wheelAria} />
      <button
        type="button"
        disabled={delta === 0}
        onClick={() => {
          onApply(delta)
          onClose()
        }}
        className="mt-4 h-12 w-full rounded-input bg-pine text-body font-bold text-white shadow-[0_6px_16px_rgba(15,107,79,0.22)] transition active:scale-[0.99] disabled:opacity-40"
      >
        {delta === 0
          ? d.noChange
          : interpolate(d.applyPoints, { n: delta > 0 ? `+${delta}` : String(delta) })}
      </button>
    </Sheet>
  )
}
```

- [ ] **Step 3: Row → tap target.** In `OrgLeaderboardRow.tsx`, remove the `onAdd`/`onSubtract` props and the `−25/+25` button block (lines ~56-71). Change the props to `{ group, onOpen }: { group: RankedGroup; onOpen: () => void }`, wrap the row content in a `<button type="button" onClick={onOpen} …>` (full-width, `text-left`, `active:scale-[0.99]`), and add a chevron `›` on the right after the score.

- [ ] **Step 4: Tab owns the sheet.** In `LeaderboardTab.tsx`, replace the row wiring:

```tsx
  const [target, setTarget] = useState<RankedGroup | null>(null)
  // …
      {view.rows.map((group) => (
        <OrgLeaderboardRow key={group.id} group={group} onOpen={() => setTarget(group)} />
      ))}
      <PointsWheelSheet
        group={target}
        onClose={() => setTarget(null)}
        onApply={(delta) => adjust.mutate({ groupId: target!.id, delta })}
      />
```

Add `import { useState } from 'react'`, `import type { RankedGroup } from '../../../../lib/leaderboard'`, and `import { PointsWheelSheet } from './PointsWheelSheet'`. Keep `adjust = useAdjustGroupPoints()`.

- [ ] **Step 5: Add strings.** In `translations.ts` `org.detail`:

```
awardTitle:  EN 'Award points'      UZ 'Ball berish'          RU 'Начислить баллы'
applyPoints: EN 'Apply {n}'         UZ '{n} qoʻllash'         RU 'Применить {n}'
noChange:    EN 'No change'         UZ 'Oʻzgarishsiz'         RU 'Без изменений'
wheelAria:   EN 'Points wheel'      UZ 'Ballar gʻildiragi'    RU 'Колесо баллов'
```

- [ ] **Step 6: Validate.** Run: `npm run validate` — Expected: PASS.

- [ ] **Step 7: Visual check.** Open `/org/camps/:id/leaderboard`. Tapping a group opens the sheet; scrolling the wheel snaps to values `-25..+25` (0 centered, `Apply` disabled at 0); Apply commits and the board re-ranks instantly; the sheet closes.

- [ ] **Step 8: Commit.**

```bash
git add -A && git commit -m "feat(org): points scroll-wheel sheet for awarding group points"
```

---

## Self-Review

**Spec coverage:** A → Task 1 (single-camp home, chat button, On-site tile, no create). B → Task 2 (day-switcher). C → Task 4 (wheel sheet, ±25 step 5, `useAdjustGroupPoints`). D → Task 3 (group-photo uploader, group channel only, shared `useGroupStore`). All four slices covered; build order A→B→D→C preserved (Tasks 1,2,3,4).

**Placeholder scan:** No TBD/TODO; every code step shows code; string tables give real EN/UZ/RU.

**Type consistency:** `openChat` defined in Task 1 interface, used in shell. `PointsWheel`/`PointsWheelSheet` signatures in Task 4 interfaces match usage. `RankedGroup` fields (`id/name/initials/color/photo/score`) match `OrgLeaderboardRow` usage. `useAdjustGroupPoints().mutate({ groupId, delta })` matches existing `LeaderboardTab`. `ScheduleDay` shape matches `DaySelector` props.

**Known follow-up (out of scope, per spec):** server-side permission enforcement for photo change + point awards; removing the orphaned `statActiveCamps`/`newCamp`/`campsLabel` strings in a later cleanup.
