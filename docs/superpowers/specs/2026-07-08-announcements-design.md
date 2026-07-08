# Announcements (Participant) — Design Spec

**Date:** 2026-07-08
**Surface:** Participant app (`/camp/*`)
**Status:** Approved design, pre-implementation

---

## 1. Goal

Give participants a first-class Announcements experience: a feed they can browse
and read, with unread tracking. Announcements are authored on the (not-yet-built)
organizer dashboard, so the **data contract and data layer must be solid enough
that wiring the real backend changes nothing in the UI** — same mock→real seam the
rest of the app uses.

Scope decisions locked during brainstorming:

- **Interactions:** view + unread tracking. No acknowledgement / read-receipts /
  reactions (those pull in organizer analytics + write endpoints, out of scope).
- **Detail view:** dedicated route `/camp/announcements/:id`, so push notifications
  can deep-link to a specific announcement.

Non-goals (explicitly out of v1): attachments, reactions, read-receipts visible to
organizers, composing (that is the organizer surface), cross-device read sync.

---

## 2. Data contract

The shape the organizer composes and the backend stores. Lives in
`api/services/announcements.service.ts` (the data contract travels with the service
that owns the endpoint).

```ts
export type AnnouncementScope =
  | { kind: 'camp' }                                        // whole camp
  | { kind: 'group'; groupId: string; groupName: string }   // one group

export type AnnouncementAuthor = {
  id: string
  name: string
  role: 'organizer' | 'organization'
  avatarColor: string          // background for the initials tile
  photo?: string | null
}

export type Announcement = {
  id: string
  campId: string
  title?: string               // optional headline; many announcements are one-liners
  body: string                 // main content, may be multi-paragraph
  scope: AnnouncementScope
  author: AnnouncementAuthor
  pinned: boolean
  createdAt: string            // ISO 8601 UTC — NOT a relative string
  updatedAt?: string           // present only if edited
  // attachments?: Attachment[] // reserved for a later version; not built in v1
}
```

**Rationale (the parts that must not be gotten wrong):**

- **`scope` is a discriminated union.** The organizer targets "all camp" or one
  specific group; this models that exactly and forces the UI to handle both when
  rendering the meta line. Direct map to the organizer composer's targeting.
- **`createdAt` is ISO UTC, never "20 min ago".** Relative time is a view concern,
  computed client-side per the user's language. Storing a relative string breaks on
  re-read and can't be translated. Timezone correctness = ReadyProduct §4.
- **`author` is a nested object** (id/name/role/color/photo) matching the backend
  join to the organizer record; the participant sees name + role.
- **`title` optional** so one-liners and headline+body both fit.
- **`pinned`** drives the top section; server returns the list pinned-first then
  newest.

### Fetchers (single boundary, mock now)

```ts
fetchAnnouncements(campId: string): Promise<Announcement[]>   // list
fetchAnnouncement(campId: string, id: string): Promise<Announcement>   // one
```

Today each returns mock data with the real `axiosInstance.get(...)` call commented
out — identical seam to `lib/campHome.ts`. Flipping mock→real touches only these
two functions.

Endpoints when real:
- `GET /camps/:campId/announcements`
- `GET /camps/:campId/announcements/:id`

---

## 3. Data layer placement

Per `frontend/CLAUDE.md` ("don't add new features to the old `lib/` shape"),
announcements use the `api/` layer:

| File | Responsibility |
|---|---|
| `api/services/announcements.service.ts` | Types (the contract) + the two fetchers. No React. |
| `api/queries/announcements.queries.ts` | `useAnnouncements(campId)`, `useAnnouncement(campId, id)`. Components call these only. |
| `api/queryKeys.ts` (edit) | Add `campKeys.announcements(campId)` and `campKeys.announcement(campId, id)`, nested under `campKeys.all`. |
| `lib/mockAnnouncements.ts` | Mock feed (keeps the `mock*` convention); imported by the service. |

Realtime: a future `announcement:new` event invalidates
`campKeys.announcements(campId)` from `realtimeBridge.ts`. Not wired now; the nested
key makes it a one-liner later.

---

## 4. Unread tracking

**Read-state is client-owned, not part of the content contract.**

- New persisted Zustand store `store/useAnnouncementReads.ts`, holding a
  `Set<announcementId>` (persisted → survives PWA relaunch, like `useThemeStore`).
- API: `markRead(id)`, `isRead(id)`, and the raw set for deriving counts.
- **Unread = feed items whose id is not in the read-set.**
- The detail screen calls `markRead(id)` on mount.

Why client-owned: content (what the organizer wrote) is shared/immutable/cacheable;
"which ones I've read" is per-user and changes constantly — mixing them would make
every mark-read invalidate the shared content cache. This honors the repo rule
"server data → React Query, client-owned UI → Zustand." Because the chosen scope has
no organizer-visible read-receipts, client-side is correct, not a shortcut. Seam: if
cross-device sync is ever wanted, read-state graduates to a server field behind the
same `markRead()` API.

Unread count surfaces on: the Home notification bell (`CampCover`) and the Home
"Latest announcement" card. React Query dedups, so the Home count and the list
screen share one fetch.

---

## 5. Components & routing

```
components/participant/announcements/
  AnnouncementsScreen.tsx        # /camp/announcements — list; owns useAnnouncements
  AnnouncementDetailScreen.tsx   # /camp/announcements/:id — full view; marks read on open
  AnnouncementListItem.tsx       # one card: pinned variant, unread dot, scope+time meta
  AnnouncementsSkeleton.tsx      # loading placeholder
lib/relativeTime.ts              # i18n-aware "20 min ago / 2h / Yesterday"
```

**Reuse existing primitives:** `Avatar` (author), `Badge` (scope/pinned pill),
`Skeleton`, and the empty-state pattern. Do not hand-roll these.

**Routing (`App.tsx`):** replace the `announcements` placeholder route with
`<AnnouncementsScreen>`; add child `announcements/:id` → `<AnnouncementDetailScreen>`.
List is a tab-adjacent secondary screen; detail has an explicit Back.

**Screen states (each screen):** loading (skeleton), empty ("No announcements yet"),
error (graceful, non-crashing), success — per ReadyProduct §9.

---

## 6. Visual design

Faithful to the prototype's vocabulary, with intentional upgrades:

- **Pinned section on top** — amber-tint cards (`bg-amber-tint`, amber border,
  "📌 Pinned"), matching the prototype's notice styling.
- **Feed below** — white cards grouped by day (Today / Yesterday / earlier date).
  Each: author avatar + name, a scope pill (`Badge` pine = "All camp", sky = group
  name), relative time, title/body preview (line-clamped).
- **Unread** — a small pine dot on unread items; unread cards read slightly
  brighter. Home bell + Home card show the unread count.
- **Detail** — full body, author header, scope + exact localized date/time, an
  "edited" indicator when `updatedAt` is present. Marks read on open.
- Three deliberate responsive layouts (mobile / tablet / desktop), dark mode via
  `@theme` tokens (no raw hex), full EN/UZ/RU.

---

## 7. i18n

Add an `announcements` namespace to `i18n/translations.ts` (typed → all three
languages required by the compiler): screen title, empty state, "Pinned", "All
camp", day-group labels (Today / Yesterday), "edited", and relative-time units
(minute/hour/day, "just now"). `lib/relativeTime.ts` composes these with
`interpolate` so each language places tokens per its grammar.

---

## 8. Refactor included in this work

Home currently reads a **single** embedded `announcement` from `CampHome`
(`lib/campHome.ts`), while the list reads the **feed**. Two sources of truth that
will drift. As part of this work:

- Point `AnnouncementCard` (Home) at `useAnnouncements`, showing the top
  pinned/latest item.
- Remove `announcement` from the `CampHome` type and from `mockCamp.ts`.

Result: one source of truth for announcement content.

---

## 9. Files touched — summary

**New:**
`api/services/announcements.service.ts`, `api/queries/announcements.queries.ts`,
`lib/mockAnnouncements.ts`, `lib/relativeTime.ts`,
`store/useAnnouncementReads.ts`, `components/participant/announcements/` (4 files).

**Edited:**
`api/queryKeys.ts` (add keys), `App.tsx` (routes),
`components/participant/home/AnnouncementCard.tsx` (feed source + unread count),
`lib/campHome.ts` + `lib/mockCamp.ts` (drop embedded `announcement`),
`i18n/translations.ts` (announcements namespace).

---

## 10. Acceptance

- Participant opens `/camp/announcements`: pinned-first, then day-grouped feed;
  loading/empty/error states behave.
- Tapping an item opens `/camp/announcements/:id` with full content and marks it
  read; unread count drops accordingly.
- Home bell + Home card reflect the unread count and the latest announcement, from
  the same feed source.
- Works in EN/UZ/RU with correct relative + absolute time formatting; dark mode
  intact; no raw hex; no hard-coded strings.
- Swapping the two fetchers to real `axiosInstance` calls requires no UI change.
