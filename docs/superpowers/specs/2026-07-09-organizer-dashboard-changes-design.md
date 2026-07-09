# Organizer Dashboard Changes — Design

**Date:** 2026-07-09
**Surface:** Organizer (`/org/*`)
**Status:** Approved, ready for implementation planning

## Summary

Four scoped changes to the organizer surface, most of them lifting existing
participant components up into `/org` rather than writing new UI:

- **A — Single-camp home.** The organizer runs one current camp. Drop the camps
  list and the "New camp" affordance; the dashboard becomes that camp's home. The
  header's top-right becomes a chat shortcut (matching the prototype).
- **B — Schedule day-switcher.** The organizer schedule shows one day at a time
  with a horizontal date-chip strip, reusing the participant `DaySelector`.
- **C — Points wheel.** Replace the fixed `−25 / +25` leaderboard buttons with a
  timer-style scroll wheel in a bottom sheet, range `−25 … 0 … +25`.
- **D — Org chat parity + group photo.** Bring the organizer chat header to
  participant-chat parity, including the group-photo uploader on the group channel.

### Guiding principle

Three of the four slices are **component reuse**, not new UI (`DaySelector`,
participant `ChatHeader`, the `Sheet` primitive, the `useAdjustGroupPoints`
mutation). This keeps the organizer and participant surfaces visually consistent
and concentrates net-new code in Slice C's wheel. Honor the design system
(`CONTEXT.md §5`): tokens not raw hex, trilingual strings, dark mode intact.

---

## Slice A — Single-camp home

**Files:** `src/components/organizer/camps/CampsScreen.tsx`,
`src/components/organizer/orgContext.ts`, `src/components/organizer/camps/StatStrip.tsx`,
`src/App.tsx`.

### Behavior

The organizer has exactly one current camp. `CampsScreen` stops being a list and
becomes that camp's home screen.

- **Collapse the camps grid to a single `CampCard`** for the current live camp
  (first `active`, else first). Keep the one card — it shows the camp at a glance
  and is tappable into the camp's tabs (`openCamp`) — but drop the multi-camp `.map`,
  the `campsLabel` heading, and the empty state.
- **Remove** the `+ New camp` button. Remove `openCreate` from `orgContext` and
  delete the `/org/camps/new` route (`OrgComingSoon`) from `App.tsx`.
- **Header:** `Welcome back, {name}` (kept) + the camp's name as the `h1` (was
  "Your camps"). Top-right becomes a **chat button** — message icon with the unread
  badge — that navigates to `/org/chat` (add `openChat` to `orgContext`, or reuse
  the existing nav). Mirrors prototype line 721 (`goOChat`).
- **Keep** the stat strip, quick links (Live map / Leaderboard), and standings
  widget, all now bound to the single primary camp (the existing
  `primary = active ?? first` logic collapses to "the one camp").

### Stat strip

Current tiles: Participants · **Active camps** · Groups. "Active camps" is
meaningless for a single camp. Replace with **On-site** (live check-in count) so the
three tiles read **Participants · Groups · On-site**. On-site is dynamic and ties
into the live/safety story; source it from the existing summary query (add the
field to `OrganizerSummary` when the endpoint is real; mock provides it now).

### Spec alignment

This is a deliberate, reasoned change, not a contradiction of `ReadyProduct.md`.
`CONTEXT.md §3` places camp creation at the **organization** (developer) tier —
"creates organizers, camps, participants" — while the organizer "runs camps."
Removing the organizer's "New camp" button moves the app *toward* the hierarchy.

### i18n

Remove `org.camps.newCamp` usage; the header title comes from camp data, not a
static string. Any new strings (chat button `aria-label`, "On-site" tile label)
ship EN/UZ/RU in `translations.ts`.

---

## Slice B — Schedule day-switcher

**Files:** `src/components/organizer/detail/schedule/ScheduleTab.tsx`,
reuse `src/components/participant/schedule/DaySelector.tsx`.

### Behavior

The organizer `ScheduleTab` currently renders **every** day stacked under
"Today / Yesterday" headers. Change it to show **one day at a time**:

- Render `DaySelector` (the participant day-chip strip: one chip per day with
  activities, today highlighted and auto-centered) at the top of the tab.
- Track the selected day in local `useState`, defaulting to today (or the first day
  with activities). Below the strip, render only the selected day's rows.
- Keep the "Add activity" button and `AddActivitySheet` unchanged.
- Row styling matches the prototype (line 1117): `time (DM Mono) · title · audience`.
  The existing `OrgActivityRow` already covers this; verify it matches.

### Reuse note

`DaySelector` takes `days: ScheduleDay[]`, `selectedKey`, `onSelect`. The org
schedule already groups via `groupIntoDays(data)` — feed those day buckets straight
into the selector. No changes to the selector itself; if a prop tweak is needed,
extend it rather than fork it.

---

## Slice C — Points wheel

**Files:** `src/components/organizer/detail/leaderboard/OrgLeaderboardRow.tsx`,
`src/components/organizer/detail/leaderboard/LeaderboardTab.tsx`, a new
`PointsWheelSheet` (built on `src/components/ui/Sheet.tsx`), and a new wheel
component. Reuse `useAdjustGroupPoints` from `src/lib/leaderboard.ts`.

### Behavior

Replace the inline `−25 / +25` buttons on each leaderboard row with a
tap-to-award flow:

- The row becomes tappable (add a chevron affordance). Tapping opens a **bottom
  sheet** (the `Sheet` primitive) titled with the group name + current score.
- The sheet contains a **timer-style scroll wheel**: values `−25 … 0 … +25`,
  **0 centered**, **snapping in steps of 5** (`−25, −20, … 0, … +20, +25` = 11
  stops). The centered value is the selection; off-center values dim.
- A primary button reads **`Apply +N`** (or `−N` / `Apply` at 0). Tapping commits
  the delta via `useAdjustGroupPoints.mutate({ groupId, delta })` — the existing
  optimistic mutation — and closes the sheet. The board re-ranks live, unchanged.
- At delta 0, Apply is a no-op / disabled.

### Why a sheet (not inline)

The leaderboard is a vertical scrolling list. A vertical scroll wheel nested inside
a list row creates a **gesture conflict** — a finger drag is ambiguous between
scrolling the wheel and the page, which mobile browsers resolve inconsistently. A
bottom sheet gives the wheel its own surface where the only vertical gesture is the
wheel. It also has room for a proper dial.

### Wheel implementation notes

- Native-feeling snap: a vertical scroll container with `scroll-snap-type: y
  mandatory` and each value a snap point is the simplest robust approach (no
  physics library — YAGNI). The centered snapped item is the value; read it from
  scroll position or an `IntersectionObserver`.
- Respect the design system: pine for the selected value, muted for off-center,
  tokens throughout, works in dark mode.
- Accessibility: the wheel is also operable without a drag — expose the value with
  `aria` and allow up/down (buttons or arrow keys) as a fallback so it's not
  drag-only.

### i18n

New strings (sheet title, `Apply {n}`, wheel `aria-label`) ship EN/UZ/RU. Use
`interpolate` for the `{n}` in the button.

---

## Slice D — Org chat parity + group photo

**Files:** `src/components/organizer/chat/OrgChatScreen.tsx`, reuse
`src/components/participant/chat/ChatHeader.tsx`, `src/store/useGroupStore.ts`.

### Behavior

The organizer chat header is a static emoji tile with no photo upload. Bring it to
participant-chat parity:

- On the **group channel** ("Mening guruhim" / `channel === 'group'`), render the
  participant `ChatHeader` (or its uploader treatment) so the organizer can upload /
  replace the group photo — tap the tile → file picker → the photo overrides the
  emoji. The participant chat already implements exactly this.
- On the **Organizers team channel** (`channel === 'organizers'`), keep the emoji
  tile — it is a team, not a group with an identity photo. No uploader there.
- Keep the existing channel toggle, online rail, locked-panel gating, and the
  reused `Composer`.

### Shared group photo (chosen default, verify later)

A coordinator's uploaded group photo writes to the **same `useGroupStore` slot** the
participant group photo uses, so the group has one photo everywhere (chat header +
Ranks). This is the right default in the mock era. **Flag for re-verification when
the real backend lands:** organizer and participant identities may be scoped
differently server-side, and group-photo write permission must be enforced
server-side (only a coordinator/organizer of that group may change it) — a hidden
button is not a permission (`CLAUDE.md` guardrail).

### Reuse note

`ChatHeader` currently takes participant-shaped props (`group`, `members`,
`onMemberTap`, `onOpenMembers`, `groupPhoto`, `onChangePhoto`). If the org channel's
data shape differs, adapt at the call site or add a thin prop rather than forking
the component.

---

## Build order

**A → B → D → C.** A reshapes navigation (the chat button + camp home), so it lands
first for a stable base. B and D are quick reuse wins. C is last — it is the only
net-new UI and benefits from the rest being settled. Each slice is independently
shippable and reviewed on its own.

## Out of scope

- Multi-camp organizer views, camp creation/editing by organizers (moved to the
  organization tier).
- Per-activity point awards (points stay attached to groups; "activities /
  attendance / challenges" remain breakdown categories, not schedule items).
- Real backend wiring — these changes stay within the mock/`lib` + `api` seams
  already in place. As flagged in Slice D, server-side permission enforcement
  (who may change a group photo, award points) is required before launch but is
  not built here.
