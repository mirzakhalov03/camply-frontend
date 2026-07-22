# Profile Support + Home Polish — Design

**Date:** 2026-07-22
**Surface(s):** Participant + Organizer + Organization (frontend only)
**Branch:** `feat/support-weather-group-polish` (in `camply-frontend`, off `dev`)

## Summary

Three small, independent, **frontend-only** changes that ship together:

1. **Support button** on all three profile screens — opens a Telegram chat with the
   Camply team (`t.me/camplyadmin`).
2. **Weather chip** on the participant home cover — current temperature, reusing the
   existing organizer weather data.
3. **Group avatars cap** on the participant home "My group" card — show at most 4
   avatars + a "+N" counter, fixing an overflow bug.

No backend work, no new endpoints, no new dependencies.

## Motivation

- **Support:** users (participants, organizers, the org) currently have no in-app way
  to reach the Camply team. A Telegram deep link is the fastest path to a real support
  channel while a richer in-app flow is out of scope.
- **Weather:** participants benefit from the same at-a-glance weather the organizer
  already sees — useful for an outdoor camp. The data layer already exists.
- **Group avatars:** a real layout bug. `MyGroupCard` renders *every* group member as
  an overlapping avatar, so an 8-person group overflows its row and collides with the
  floating SOS button (see the reported screenshot).

## Non-goals (explicitly out of scope)

- No in-app support ticketing / form / chat — Telegram deep link only, for now.
- No multi-day weather **forecast** — current temperature + a sky glyph only, matching
  the organizer tile.
- No backend changes to how group members are served — the cap is purely presentational.

---

## 1. Support button

### Behavior

A tappable card that opens `https://t.me/camplyadmin` in a new context
(`target="_blank"`, `rel="noopener noreferrer"`). On mobile with Telegram installed,
this hands off to the app; otherwise it opens Telegram web. No JavaScript handler, no
backend, no auth — a plain anchor.

**One destination for everyone** — participants, organizers, and the organization all
message the same account.

### Component

A single shared component (working name `SupportCard`) so the Telegram URL and copy
live in exactly one place. Rationale: three copy-pasted buttons would be three places
to drift; one component is the single source of truth (mirrors the codebase's
"one source of truth" discipline). If the handle changes — or Telegram is later
swapped for an in-app form — it is a one-file edit.

- Styled to match the existing surface cards on the profile screens (rounded-card,
  `border-line`, `bg-surface`, soft shadow) so it drops in identically on all three.
- Visual: a Telegram/support glyph, the label, and a subtitle.
- It is an `<a>`, not a `<button>` — semantically a navigation to an external
  resource.

### Placement

Directly **above the logout button** on each profile screen:

- Participant: `components/participant/profile/ProfileScreen.tsx` (after `SettingsList`).
- Organizer: `components/organizer/profile/OrgProfileScreen.tsx` (after Settings card).
- Organization: `components/organization/profile/AdminProfileScreen.tsx` (after Settings card).

### i18n

New keys in `src/i18n/translations.ts` under `profile`, in **EN / UZ / RU**:

- `profile.support` → e.g. "Support" / "Yordam" / "Поддержка"
- `profile.supportSubtitle` → e.g. "Contact us on Telegram" / "Telegram orqali bogʻlaning" / "Свяжитесь с нами в Telegram"

(Exact wording finalized during implementation; all three languages required — no
hard-coded copy.) The component reads copy via `useTranslation()`.

The Telegram URL itself is a constant in the component (config, not translated).

---

## 2. Weather chip — participant home cover

### Data

Reuse the **existing** `useCurrentWeather()` hook
(`api/queries/weather.queries.ts` → `api/services/weather.service.ts`): device
geolocation → Open-Meteo → `{ tempC, condition, fetchedAt }`. Keyless, CORS-friendly,
runs entirely in the browser. **No forecast, no backend, no new dependency.**

### Presentation

A small **glass chip** inside `components/participant/home/CampCover.tsx`, showing the
rounded temperature + the condition glyph (e.g. `24° ☀️`). It reuses the same coarse
`CONDITION_GLYPH` mapping the organizer `WeatherTile` uses (extract to a shared spot if
convenient, otherwise mirror it — a 6-entry map).

- **Position:** **top-left** of the cover, mirroring the bell + theme-toggle controls
  that float top-right. This balances the header and avoids crowding the camp title and
  location line at the bottom.
- **Style:** matches the existing floating controls — `bg-white/15`,
  `backdrop-blur-md`, `border-white/30`, white text, rounded-full, small shadow — so it
  reads as part of the same control layer in both light and dark mode.

### Degradation (must not disturb the cover)

Weather is external and may be slow, denied, or offline. The rule is simple and
unambiguous: **the chip renders only when weather data is available.**

- **Loading, error, or location denied:** the chip is **not rendered** — nothing shows.
- **Data available:** the chip appears with temp + glyph.

No skeleton, no `—°` dash, no error state in the hero. The cover always renders
regardless of weather; the chip simply appears once (and if) data arrives. This is
stricter than the organizer tile (which shows a `—°` dash) on purpose — a dash is fine
in a stat strip but reads as broken in a hero image.

---

## 3. Group avatars — cap at 4 + "+N"

### Change

In `components/participant/home/MyGroupCard.tsx`, cap the visible overlapping avatars
at **4**. If the group has more members, append a neutral **"+N"** counter circle where
`N = memberCount - 4`.

- The first 4 avatars keep their per-member color (runtime data → inline style, already
  the case).
- The "+N" circle uses neutral tokens (`bg-soft` / `text-muted`), same size and overlap
  as the avatars, so it reads as "and more" rather than another member.
- `memberCount` (already on the card) drives both the "+N" number and the existing
  "· N members" label — unchanged.

### Why this fixes the bug

The row currently maps `group.members` in full; 8 members render 8 overlapping circles
that overflow horizontally, wrap the group name, and collide with the floating SOS
button. Capping the render (data unchanged) keeps the row compact and clear of SOS.

This is purely presentational: `group.members.slice(0, 4)` + a computed remainder. No
query change, no backend touch. If the backend ever serves very large member arrays for
this card, a server-side cap can be added later; client-side slicing is sufficient now.

---

## Testing / verification

No automated tests (project preference). Manual verification:

- **Support:** the card appears above logout on all three profiles; tapping opens
  `t.me/camplyadmin`; copy renders in all three languages.
- **Weather:** chip appears top-left of the participant cover with a plausible temp +
  glyph; with location denied/offline, the cover still renders cleanly and the chip is
  absent (no error surfaced); works in light and dark mode.
- **Group avatars:** an 8-member group shows 4 avatars + "+4"; the row no longer
  overflows or collides with SOS; a ≤4-member group shows no counter.
- `npm run validate` (lint + format + typecheck) passes for touched files.

## Risks

- Low. All three are additive/presentational and frontend-only.
- Weather already handles the permission/offline edge cases; the chip inherits them.
- Only real judgment call — Support card visual weight — is contained to one component.
