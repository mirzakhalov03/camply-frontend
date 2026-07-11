# Notifications & Web Push — Design Spec

> Date: 2026-07-09 · Surface: participant · Status: approved, ready for plan

## 1. Summary

Give participants **real push notifications that arrive even when the web app is
closed** (announcements/news first), delivered via the open **Web Push** standard,
and a single **Notifications on/off** toggle in Profile that genuinely subscribes /
unsubscribes.

"Notifications" and "announcements" are **the same place**: the home-screen bell
opens the existing Announcements feed (already wired via
`onOpenNotifications={goAnnouncements}`). There is **no** separate notifications
screen — the dead `/camp/notifications` route is removed.

Scope of this spec is the **frontend architecture** end-to-end: the installable
PWA, the service worker, the push subscription, the permission flow, the toggle, and
a precise **backend contract**. The backend *sender* is out of scope (built later);
the frontend depends only on the contract, following Camply's existing mock→real
boundary.

## 2. Goals / Non-goals

**Goals**
- Closed-app push for announcements, deep-linking to the right screen on tap.
- One master Notifications toggle in Profile that really subscribes/unsubscribes.
- Installable PWA (manifest + service worker + icons) — the prerequisite for push,
  and required for push on iOS at all.
- Zero fake behavior on the frontend: every piece the frontend owns is
  production-real; the single seam to the backend is a clearly-marked stubbed call.
- Graceful degradation: unsupported browsers, denied permission, iOS-not-installed.

**Non-goals (this spec)**
- The backend push **sender**, subscription **storage**, and targeting by
  camp/group/role. (Contract defined here; implementation later.)
- Per-category preferences (announcements vs chat vs reminders). v1 is a single
  master on/off, matching the Location-sharing switch. Categories are a later
  extension of the same store + contract.
- Push for chat / schedule / SOS / leaderboard. The architecture supports them
  (payload carries a `type` + `url`); wiring each is follow-up work.
- A soft pre-permission prompt sheet. Optional later polish; v1 asks on toggle tap.

## 3. Hard constraints (these drive the design)

- **The frontend cannot send a push to itself.** Closed-app notifications originate
  server-side. The frontend does everything up to and including *receiving*; the
  backend does the sending.
- **iOS requires an installed PWA.** On iPhone/iPad, Web Push only works after the
  user adds Camply to the home screen (Safari, iOS 16.4+). "Install the app" is
  therefore part of the notifications flow, surfaced in the toggle's disabled state.
- **Permission is one-shot.** If a user taps "Block", the browser will not prompt
  again. So we ask **only on explicit toggle tap**, never on page load.

## 4. Architecture

Push touches three of Camply's existing layers. Each piece lands where the
frontend CLAUDE.md rules already dictate:

- **Server write (register/unregister subscription)** → React Query **mutation**
  (`api/queries`) over a typed **service** (`api/services`). The service owns the
  contract types.
- **Toggle preference + permission status** → **Zustand `persist`** store (client
  UI state, same pattern as theme/language). Never mirror the server subscription
  here.
- **Raw Web Push browser calls** → a plain async module in `src/lib/push/` (not
  React).

### 4.1 PWA foundation

- Add `vite-plugin-pwa` to `vite.config.ts` in **`injectManifest`** strategy
  (required: `generateSW` has nowhere to add a `push` listener; `injectManifest`
  lets us author the service worker while the plugin injects the offline-cache
  manifest into it).
- **Web app manifest** (via the plugin's `manifest` option):
  - `name: "Camply"`, `short_name: "Camply"`
  - `theme_color: "#0A5039"`, `background_color: "#f4f1ea"` (paper)
  - `display: "standalone"`, `start_url: "/camp/home"`, `scope: "/"`
  - `lang` + `dir` (default `en`)
  - icons: `192×192`, `512×512`, and a `512×512` **maskable** variant.
- **New assets:** generate the three PWA icons from `public/favicon.svg`. (No brand
  icon set exists yet; favicon-derived is the agreed source.)
- Register via `virtual:pwa-register` in `main.tsx`, wired to a small on-brand,
  translated "update available / offline ready" prompt.

### 4.2 Service worker — `src/sw.ts` (authored by us, compiled by the plugin)

Listeners:
- **`push`** — parse the JSON payload; call
  `self.registration.showNotification(title, { body, icon, badge, tag, data: { url } })`.
  Fall back to a generic translated title/body if the payload is malformed.
- **`notificationclick`** — `event.notification.close()`, then focus an existing
  Camply client if one is open, else `clients.openWindow(data.url)`. Deep-links land
  on the exact screen because every route is a real URL.
- **`pushsubscriptionchange`** — re-subscribe with the VAPID key and re-`POST` to the
  backend. Without this, subscriptions silently expire over time. Required for
  reliability.

The plugin injects `self.__WB_MANIFEST` (offline shell precache) into this same file.

### 4.3 Browser glue — `src/lib/push/pushClient.ts`

Plain async functions, no React:
- `isSupported(): boolean` — `'serviceWorker' in navigator && 'PushManager' in
  window && 'Notification' in window`.
- `isStandalone(): boolean` — display-mode / iOS `navigator.standalone` check
  (drives the iOS-install hint).
- `getPermission(): NotificationPermission`.
- `requestPermission(): Promise<NotificationPermission>`.
- `subscribe(vapidPublicKey): Promise<PushSubscription>` — awaits
  `navigator.serviceWorker.ready`, calls `pushManager.subscribe({ userVisibleOnly:
  true, applicationServerKey })`.
- `unsubscribe(): Promise<void>` — reads current subscription, `unsubscribe()`s it,
  returns its endpoint for the backend `DELETE`.
- `urlBase64ToUint8Array(base64)` — required VAPID-key decoder (browsers need the key
  as a `Uint8Array`).

### 4.4 Client state — `src/store/usePushStore.ts`

Zustand + `persist`:
```
{
  enabled: boolean            // the toggle
  permission: 'default' | 'granted' | 'denied'
  status: 'idle' | 'unsupported' | 'subscribing' | 'subscribed' | 'denied' | 'error'
}
```
Only `enabled` truly needs persisting; `permission`/`status` are refreshed on load
from the live browser API.

### 4.5 Server boundary — `src/api/services/push.service.ts` + `push.queries.ts`

- **Service** (owns contract types): `registerSubscription(sub)`,
  `unregisterSubscription(endpoint)`. Real axios call commented out with a mock
  resolve, per the established mock→real pattern; flipping to real changes no UI.
- **Queries**: `useRegisterPush()`, `useUnregisterPush()` mutations. Components never
  call the service or axios directly.

### 4.6 Orchestration hook — `src/lib/push/usePushNotifications.ts`

The **only** thing the UI touches. Ties store + pushClient + mutations together.
Returns:
```
{ supported, standalone, permission, enabled, status, enable(), disable() }
```
- `enable()`: `requestPermission()` → if `granted`: `subscribe()` →
  `useRegisterPush` → store `enabled=true, status='subscribed'`. If `denied`: store
  `permission='denied'`, `enabled` stays false.
- `disable()`: `unsubscribe()` → `useUnregisterPush(endpoint)` → store
  `enabled=false, status='idle'`.
- On mount: reconcile `permission`/`status` from the live browser API + existing
  subscription.

### 4.7 The toggle — `src/components/participant/profile/SettingsList.tsx`

The Notifications row becomes a **switch**, placed **after Location sharing**,
structurally identical to it, driven by `usePushNotifications()`:

| Condition | Toggle | Helper line (muted, translated) |
| --- | --- | --- |
| supported, off | interactive, off | — |
| supported, on | interactive, on | — |
| just denied | snaps back to off | "Turn on notifications in your browser settings." |
| unsupported / iOS not installed | disabled | "Install Camply to your home screen to get alerts." |

Removed from this file: the faked `2` badge and its hardcoded `#3a2807` hex.

## 5. Backend contract (frontend depends on it; backend builds later)

```
POST   /api/push/subscribe    body: { subscription: PushSubscriptionJSON }   → 201
DELETE /api/push/subscribe    body: { endpoint: string }                     → 204

Env:
  VITE_VAPID_PUBLIC_KEY   → frontend (exposed, safe)
  VAPID_PRIVATE_KEY       → backend only (never in the client / repo)

Push payload the service worker expects (JSON):
  { title: string, body: string, url: string, tag?: string, type?: string }
```
`type`/`url` future-proof the payload for chat/schedule/SOS pushes without a SW
change.

## 6. Cleanup (folds in earlier decisions)

- Delete route `/camp/notifications`, its `ComingSoonRoute` `'notifications'` case in
  `App.tsx`, and `goNotifications` in `campContext.ts` / `ParticipantDashboard.tsx`.
- `ProfileScreen` stops passing `onNotifications`.
- Remove the `2` badge + hardcoded hex in `SettingsList`.

## 7. i18n & design system

- All new copy ships **EN/UZ/RU** in `translations.ts`: toggle label (reuse existing
  `profile.notifications`), the two helper lines, the PWA update/offline prompt, and
  the service-worker notification fallback title/body.
- Toggle + helper text use design tokens (no raw hex); switch mirrors the
  Location-sharing switch exactly.

## 8. File inventory

New:
- `src/sw.ts`
- `src/lib/push/pushClient.ts`
- `src/lib/push/usePushNotifications.ts`
- `src/store/usePushStore.ts`
- `src/api/services/push.service.ts`
- `src/api/queries/push.queries.ts`
- `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512.png`

Modified:
- `vite.config.ts` (VitePWA plugin)
- `src/main.tsx` (register SW + update prompt)
- `src/components/participant/profile/SettingsList.tsx` (real toggle, remove badge)
- `src/components/participant/profile/ProfileScreen.tsx` (drop `onNotifications`)
- `src/App.tsx`, `src/components/participant/campContext.ts`,
  `src/components/participant/ParticipantDashboard.tsx` (remove notifications route)
- `src/i18n/translations.ts` (new strings ×3 languages)
- `.env` / env docs (`VITE_VAPID_PUBLIC_KEY`)

## 9. Edge cases & reliability

- **Unsupported browser** → toggle disabled + hint; app otherwise unaffected.
- **SW registration failure** → app must not break; push simply unavailable.
- **Permission denied** → no re-prompt; recovery hint shown.
- **iOS in Safari (not installed)** → toggle disabled + install hint.
- **Subscription rotation** → `pushsubscriptionchange` re-registers.
- **Register mutation fails** → status `error`, toggle reverts, retryable.

## 10. Open questions

None. (Single master toggle confirmed; icons generated from favicon confirmed.)
