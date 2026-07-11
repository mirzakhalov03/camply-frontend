# Notifications & Web Push Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give participants real Web Push notifications that arrive when the app is closed, plus a working Notifications on/off toggle in Profile — the full frontend, with a clean stubbed seam to a future backend.

**Architecture:** `vite-plugin-pwa` (injectManifest) makes the app an installable PWA and compiles a hand-written service worker (`src/sw.ts`) that receives pushes and deep-links on tap. A browser-glue module (`src/lib/push/`) owns the Web Push API calls; a Zustand `persist` store owns the toggle/permission UI state; a React Query mutation pair (`src/api/`) registers the subscription with the backend (call stubbed, per Camply's mock→real pattern). One orchestration hook wires it together and is the only thing the toggle touches.

**Tech Stack:** React 19, Vite 8, TypeScript, `vite-plugin-pwa` + Workbox, TanStack React Query, Zustand, Web Push API.

## Global Constraints

- **No test runner** — project preference. Verify with `npm run typecheck`, `npm run lint`, and Chrome DevTools. Do NOT add tests.
- **Code style (Prettier):** no semicolons, single quotes, trailing commas, width 100.
- **TS:** `verbatimModuleSyntax` on → use `import type { … }` for type-only imports. `noUnusedLocals`/`noUnusedParameters` on → no unused symbols.
- **React 19 / react-jsx runtime** → never `import React` for JSX.
- **No path aliases** → relative imports only.
- **Design tokens, no raw hex** (dark-mode safety). New copy ships **EN/UZ/RU** in `src/i18n/translations.ts`; read via `useTranslation()`.
- **Server data → React Query only; Zustand for UI state only.**
- **Commits are gated:** the user's standing rule is no commits without explicit permission. Each task ends with a commit step — run it only once the user says so.
- **Push needs HTTPS or `localhost`.** Dev on `http://localhost:5173` works; a LAN IP will not register a service worker.

---

### Task 1: PWA foundation & installability

Make the app an installable PWA with a registered service worker (precache only — push handlers come in Task 2). This is the prerequisite for push, and for push on iOS at all.

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`
- Create: `src/sw.ts`
- Create: `src/vite-env.d.ts` (if absent) or modify existing
- Create: `src/components/PwaUpdatePrompt.tsx`
- Modify: `src/i18n/translations.ts`
- Create (generated): `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512x512.png`, `public/apple-touch-icon.png`

**Interfaces:**
- Produces: a registered service worker at `/sw.js`; `virtual:pwa-register/react`'s `useRegisterSW()` available; icons in `public/`.

- [ ] **Step 1: Install the plugin**

Run: `npm i -D vite-plugin-pwa`
Expected: added to `devDependencies`, no peer warnings that block install.

- [ ] **Step 2: Generate PWA icons from the existing favicon**

Run: `npx @vite-pwa/assets-generator --preset minimal-2023 public/favicon.svg`
Expected: PNG icons written into `public/`. If the generated names differ, rename to exactly: `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon.png`.
Verify: `ls public/*.png` lists all four.

- [ ] **Step 3: Configure `vite-plugin-pwa` in `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: null, // we register manually in main.tsx via useRegisterSW
      devOptions: { enabled: true, type: 'module' },
      manifest: {
        name: 'Camply',
        short_name: 'Camply',
        description: 'The operating system for camps',
        lang: 'en',
        theme_color: '#0A5039',
        background_color: '#f4f1ea',
        display: 'standalone',
        scope: '/',
        start_url: '/camp/home',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express backend during development
      '/api': 'http://localhost:4000',
    },
  },
})
```

- [ ] **Step 4: Create the minimal service worker `src/sw.ts` (precache only)**

```ts
/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// Injected by vite-plugin-pwa (injectManifest): the app shell to precache for
// offline. Push handlers are added in Task 2.
precacheAndRoute(self.__WB_MANIFEST)
```

- [ ] **Step 5: Add PWA client types to `src/vite-env.d.ts`**

Ensure the file contains (create it if missing):

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/react" />
```

- [ ] **Step 6: Add update-prompt i18n strings to `src/i18n/translations.ts`**

Find the `pwa` area (or add a new `pwa` group to the type and all three language objects). Add these keys to the typed shape and to **en / uz / ru**:

- `pwa.updateReady` — EN `'A new version is available.'` · UZ `'Yangi versiya mavjud.'` · RU `'Доступна новая версия.'`
- `pwa.reload` — EN `'Reload'` · UZ `'Yangilash'` · RU `'Обновить'`
- `pwa.offlineReady` — EN `'Camply is ready to work offline.'` · UZ `'Camply oflayn ishlashga tayyor.'` · RU `'Camply готов к работе офлайн.'`
- `pwa.dismiss` — EN `'Dismiss'` · UZ `'Yopish'` · RU `'Закрыть'`

Follow the exact structure the file already uses (typed interface first, then per-language objects — the compiler enforces all three).

- [ ] **Step 7: Create `src/components/PwaUpdatePrompt.tsx`**

```tsx
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from '../i18n/useTranslation'

/*
  Small toast that surfaces the two service-worker lifecycle moments:
  a new version is waiting (offer reload) or the app is offline-ready.
  Rendered once near the app root. Tokens only — no raw hex.
*/
export function PwaUpdatePrompt() {
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-card border border-line bg-surface p-4 shadow-lg">
      <p className="text-body text-content">
        {needRefresh ? t.pwa.updateReady : t.pwa.offlineReady}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-input bg-pine px-3 py-1.5 text-caption font-semibold text-white"
          >
            {t.pwa.reload}
          </button>
        )}
        <button
          type="button"
          onClick={close}
          className="rounded-input px-3 py-1.5 text-caption font-semibold text-muted"
        >
          {t.pwa.dismiss}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Mount the prompt in `src/main.tsx`**

Add the import and render it inside the router, as a sibling of `<App />`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <PwaUpdatePrompt />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

- [ ] **Step 9: Add the iOS home-screen icon link to `index.html`**

iOS uses `apple-touch-icon` for the installed home-screen icon (and installability drives push on iOS). In `index.html` `<head>`, below the existing `favicon.svg` line, add:

```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

- [ ] **Step 10: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors. (If `self.__WB_MANIFEST` errors, confirm the `vite-plugin-pwa/client` reference from Step 5 is present.)

- [ ] **Step 11: Verify installability in the browser**

Run: `npm run dev`, open `http://localhost:5173`.
In Chrome DevTools → **Application**:
- **Manifest**: name "Camply", theme color, all icons load, no errors.
- **Service Workers**: `sw.js` is **activated and running**.
- The address-bar **install icon** appears (or Application → "Installability" shows no blockers).
Expected: all three true.

- [ ] **Step 12: Commit** (only with the user's go-ahead)

```bash
git add vite.config.ts index.html src/main.tsx src/sw.ts src/vite-env.d.ts src/components/PwaUpdatePrompt.tsx src/i18n/translations.ts public/*.png package.json package-lock.json
git commit -m "feat(pwa): installable PWA foundation + service worker registration"
```

---

### Task 2: Service worker push handlers

Teach `src/sw.ts` to receive a push, show a notification, deep-link on tap, and survive subscription rotation.

**Files:**
- Modify: `src/sw.ts`

**Interfaces:**
- Consumes: the precache SW from Task 1.
- Produces: a SW that handles `push`, `notificationclick`, `pushsubscriptionchange`. Expects push payload JSON `{ title: string, body: string, url: string, tag?: string, type?: string }`.

- [ ] **Step 1: Replace `src/sw.ts` with the full handler set**

```ts
/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

// App shell precache (injected by vite-plugin-pwa).
precacheAndRoute(self.__WB_MANIFEST)

type PushPayload = {
  title: string
  body: string
  url: string
  tag?: string
  type?: string
}

// Take control quickly so a freshly-installed SW can receive pushes.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// A push arrived (app may be closed). Parse and show a notification.
self.addEventListener('push', (event) => {
  let payload: PushPayload = {
    title: 'Camply',
    body: 'You have a new notification',
    url: '/camp/home',
  }
  try {
    if (event.data) payload = { ...payload, ...(event.data.json() as Partial<PushPayload>) }
  } catch {
    // Malformed payload → fall back to the generic notification above.
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: payload.tag,
      data: { url: payload.url },
    }),
  )
})

// Tapping the notification deep-links to the right screen.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string })?.url ?? '/camp/home'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus an existing Camply tab and navigate it; else open a new one.
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

// Browsers occasionally rotate the subscription; re-subscribe + re-register so
// pushes don't silently die. The endpoint POST mirrors pushClient.subscribe().
self.addEventListener('pushsubscriptionchange', (event) => {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!key) return
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) })
      .then((sub) =>
        fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        }),
      )
      .catch(() => {
        // Best-effort; the app will re-register on next launch via the hook.
      }),
  )
})

// VAPID keys are base64url strings; the Push API needs a Uint8Array.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 3: Verify the push handler with a simulated push**

Run: `npm run dev`, reload so the new SW activates (DevTools → Application → Service Workers → check "Update on reload", then reload).
In DevTools → Application → Service Workers, use the **Push** input: type a JSON payload and click **Push**:
```json
{"title":"Dinner moved","body":"Now at 7:30pm","url":"/camp/announcements"}
```
Expected: a system notification "Dinner moved / Now at 7:30pm" appears. Clicking it focuses the tab and navigates to `/camp/announcements`.

- [ ] **Step 4: Commit** (only with the user's go-ahead)

```bash
git add src/sw.ts
git commit -m "feat(push): service worker push, click deep-link, and re-subscribe handlers"
```

---

### Task 3: Env var + browser-glue module (`pushClient`)

The non-React Web Push API boundary: feature detection, permission, subscribe/unsubscribe.

**Files:**
- Modify: `.env` (create if absent) and `.env.example` (create/modify)
- Create: `src/lib/push/pushClient.ts`

**Interfaces:**
- Consumes: `import.meta.env.VITE_VAPID_PUBLIC_KEY`.
- Produces:
  - `isPushSupported(): boolean`
  - `isStandalone(): boolean`
  - `getPermission(): NotificationPermission`
  - `requestPermission(): Promise<NotificationPermission>`
  - `subscribePush(): Promise<PushSubscriptionJSON>`
  - `unsubscribePush(): Promise<string | null>` (returns the removed endpoint, or null)

- [ ] **Step 1: Add the VAPID public key env var**

In `.env` add (a real key comes from the backend later; a placeholder is fine for now — the toggle handles a missing key gracefully):
```
VITE_VAPID_PUBLIC_KEY=
```
Mirror the line in `.env.example`. Do NOT put any private key in the frontend.

- [ ] **Step 2: Create `src/lib/push/pushClient.ts`**

```ts
/*
  The Web Push API boundary — plain async functions, no React. Everything that
  touches navigator/Notification/PushManager lives here so the rest of the app
  never speaks to the raw browser API. Consumed by usePushNotifications().
*/

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  )
}

/** True when running as an installed PWA (drives the iOS "install first" hint). */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes this non-standard flag on navigator.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export function getPermission(): NotificationPermission {
  return isPushSupported() ? Notification.permission : 'denied'
}

export function requestPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission()
}

/** Subscribe via the active service worker; returns the JSON to send the backend. */
export async function subscribePush(): Promise<PushSubscriptionJSON> {
  if (!VAPID_PUBLIC_KEY) throw new Error('Missing VITE_VAPID_PUBLIC_KEY')
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }))
  return subscription.toJSON()
}

/** Remove the current subscription; returns its endpoint so the caller can DELETE it. */
export async function unsubscribePush(): Promise<string | null> {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return null
  const { endpoint } = subscription
  await subscription.unsubscribe()
  return endpoint
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit** (only with the user's go-ahead)

```bash
git add src/lib/push/pushClient.ts .env.example
git commit -m "feat(push): Web Push browser-glue module + VAPID env var"
```

---

### Task 4: Push preference store (`usePushStore`)

Zustand `persist` store for the toggle + permission/status — client UI state only.

**Files:**
- Create: `src/store/usePushStore.ts`

**Interfaces:**
- Produces:
  - `PushStatus = 'idle' | 'unsupported' | 'subscribing' | 'subscribed' | 'denied' | 'error'`
  - `usePushStore` with `{ enabled, permission, status, setEnabled(b), setPermission(p), setStatus(s) }`

- [ ] **Step 1: Create `src/store/usePushStore.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  Client-owned notification state (a UI preference), so it lives in Zustand like
  theme/language — NOT React Query. `enabled` is the toggle and is persisted so
  the choice survives a reload / PWA relaunch. `permission` and `status` describe
  the live browser state and are refreshed from the API on load, so they are not
  persisted.
*/
export type PushStatus =
  | 'idle'
  | 'unsupported'
  | 'subscribing'
  | 'subscribed'
  | 'denied'
  | 'error'

type PushState = {
  enabled: boolean
  permission: NotificationPermission
  status: PushStatus
  setEnabled: (enabled: boolean) => void
  setPermission: (permission: NotificationPermission) => void
  setStatus: (status: PushStatus) => void
}

export const usePushStore = create<PushState>()(
  persist(
    (set) => ({
      enabled: false,
      permission: 'default',
      status: 'idle',
      setEnabled: (enabled) => set({ enabled }),
      setPermission: (permission) => set({ permission }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: 'camply-push',
      // Only the user's preference is durable; live browser state is re-read on load.
      partialize: (s) => ({ enabled: s.enabled }),
    },
  ),
)
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit** (only with the user's go-ahead)

```bash
git add src/store/usePushStore.ts
git commit -m "feat(push): persisted push-preference store"
```

---

### Task 5: Push service + queries (backend boundary, stubbed)

The typed backend contract and its React Query mutations. The real axios call is present but commented out (mock resolve), exactly like the `src/lib/` mock→real pattern.

**Files:**
- Create: `src/api/services/push.service.ts`
- Create: `src/api/queries/push.queries.ts`

**Interfaces:**
- Consumes: `axiosInstance` (import path `../axiosInstance`).
- Produces:
  - `pushService.registerSubscription(subscription: PushSubscriptionJSON): Promise<void>`
  - `pushService.unregisterSubscription(endpoint: string): Promise<void>`
  - `useRegisterPush()` / `useUnregisterPush()` mutations.

- [ ] **Step 1: Create `src/api/services/push.service.ts`**

```ts
// import { axiosInstance } from '../axiosInstance'

/*
  The push SERVICE — the backend boundary for storing a device's subscription.
  The request shapes below are the DATA CONTRACT. The real axios calls are
  commented out until the backend lands; each resolves as a no-op today so the
  toggle works locally. Flipping to real changes nothing in the UI (same pattern
  as src/lib/*).

  Contract:
    POST   /push/subscribe   { subscription }   -> 201
    DELETE /push/subscribe   { endpoint }        -> 204
*/

export type RegisterSubscriptionRequest = { subscription: PushSubscriptionJSON }
export type UnregisterSubscriptionRequest = { endpoint: string }

export const pushService = {
  registerSubscription: async (subscription: PushSubscriptionJSON): Promise<void> => {
    // return void (await axiosInstance.post('/push/subscribe', { subscription }))
    void subscription
    return Promise.resolve()
  },

  unregisterSubscription: async (endpoint: string): Promise<void> => {
    // return void (await axiosInstance.delete('/push/subscribe', { data: { endpoint } }))
    void endpoint
    return Promise.resolve()
  },
}
```

- [ ] **Step 2: Create `src/api/queries/push.queries.ts`**

```ts
import { useMutation } from '@tanstack/react-query'
import { pushService } from '../services/push.service'

/*
  The push QUERIES — React layer over pushService. Registering/unregistering a
  subscription changes server state, so both are MUTATIONS. The orchestration
  hook (usePushNotifications) calls these; components never touch the service.
*/

/** POST /push/subscribe */
export function useRegisterPush() {
  return useMutation({
    mutationFn: (subscription: PushSubscriptionJSON) =>
      pushService.registerSubscription(subscription),
  })
}

/** DELETE /push/subscribe */
export function useUnregisterPush() {
  return useMutation({
    mutationFn: (endpoint: string) => pushService.unregisterSubscription(endpoint),
  })
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors. (`axiosInstance` import stays commented — no unused-import lint error.)

- [ ] **Step 4: Commit** (only with the user's go-ahead)

```bash
git add src/api/services/push.service.ts src/api/queries/push.queries.ts
git commit -m "feat(push): subscription service + query mutations (stubbed contract)"
```

---

### Task 6: Orchestration hook (`usePushNotifications`)

The single hook the UI touches. Ties store + pushClient + mutations together and reconciles live browser state on mount.

**Files:**
- Create: `src/lib/push/usePushNotifications.ts`

**Interfaces:**
- Consumes: `pushClient` (Task 3), `usePushStore` (Task 4), `useRegisterPush`/`useUnregisterPush` (Task 5).
- Produces: `usePushNotifications()` returning
  `{ supported: boolean; standalone: boolean; permission: NotificationPermission; enabled: boolean; status: PushStatus; enable: () => Promise<void>; disable: () => Promise<void> }`.

- [ ] **Step 1: Create `src/lib/push/usePushNotifications.ts`**

```ts
import { useEffect } from 'react'
import {
  getPermission,
  isPushSupported,
  isStandalone,
  requestPermission,
  subscribePush,
  unsubscribePush,
} from './pushClient'
import { usePushStore } from '../../store/usePushStore'
import { useRegisterPush, useUnregisterPush } from '../../api/queries/push.queries'

/*
  The one hook the UI touches for notifications. It orchestrates the browser
  permission + subscription and mirrors the outcome into usePushStore (UI state),
  registering the subscription with the backend via React Query mutations.
*/
export function usePushNotifications() {
  const { enabled, permission, status, setEnabled, setPermission, setStatus } = usePushStore()
  const register = useRegisterPush()
  const unregister = useUnregisterPush()
  const supported = isPushSupported()

  // On mount, reconcile persisted preference with the live browser state.
  useEffect(() => {
    if (!supported) {
      setStatus('unsupported')
      return
    }
    const current = getPermission()
    setPermission(current)
    if (current === 'denied') setStatus('denied')
    else if (enabled && current === 'granted') setStatus('subscribed')
    else setStatus('idle')
    // Intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported])

  async function enable() {
    if (!supported) return
    setStatus('subscribing')
    const result = await requestPermission()
    setPermission(result)
    if (result !== 'granted') {
      setEnabled(false)
      setStatus(result === 'denied' ? 'denied' : 'idle')
      return
    }
    try {
      const subscription = await subscribePush()
      await register.mutateAsync(subscription)
      setEnabled(true)
      setStatus('subscribed')
    } catch {
      setEnabled(false)
      setStatus('error')
    }
  }

  async function disable() {
    try {
      const endpoint = await unsubscribePush()
      if (endpoint) await unregister.mutateAsync(endpoint)
    } finally {
      setEnabled(false)
      setStatus('idle')
    }
  }

  return {
    supported,
    standalone: isStandalone(),
    permission,
    enabled,
    status,
    enable,
    disable,
  }
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors. (If oxlint flags the `eslint-disable` comment as unused, remove that comment line — oxlint may not need it; keep the code otherwise identical.)

- [ ] **Step 3: Commit** (only with the user's go-ahead)

```bash
git add src/lib/push/usePushNotifications.ts
git commit -m "feat(push): usePushNotifications orchestration hook"
```

---

### Task 7: Real Notifications toggle in Profile

Turn the fake Notifications row into a working switch after Location sharing; drop the faked badge + hardcoded hex; stop routing to the dead screen.

**Files:**
- Modify: `src/components/participant/profile/SettingsList.tsx`
- Modify: `src/components/participant/profile/ProfileScreen.tsx`
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `usePushNotifications()` (Task 6).
- Produces: `SettingsList` no longer takes an `onNotifications` prop.

- [ ] **Step 1: Add toggle helper i18n strings to `src/i18n/translations.ts`**

Add to the `profile` group (typed shape + en/uz/ru), reusing the existing `profile.notifications` label for the row title:
- `profile.notificationsBlocked` — EN `'Turn on notifications in your browser settings.'` · UZ `'Bildirishnomalarni brauzer sozlamalaridan yoqing.'` · RU `'Включите уведомления в настройках браузера.'`
- `profile.notificationsInstall` — EN `'Install Camply to your home screen to get alerts.'` · UZ `'Ogohlantirishlar uchun Camply’ni bosh ekranga o‘rnating.'` · RU `'Установите Camply на главный экран, чтобы получать уведомления.'`

- [ ] **Step 2: Rewrite the Notifications row in `SettingsList.tsx`**

Remove the `onNotifications` prop and its `Props` type. Replace the old Notifications `<button>` (chevron + `2` badge) with a switch that reuses the Location-sharing switch markup, placed **after** Location sharing. Full new file:

```tsx
import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { LANG_LABELS } from '../../../i18n/translations'
import { LanguageSheet } from './LanguageSheet'
import { usePushNotifications } from '../../../lib/push/usePushNotifications'

/*
  Profile settings: language, location sharing, and notifications. Language opens
  a bottom-sheet picker. Location sharing is a visual toggle for now (its real
  behavior is a server-side privacy guardrail). Notifications is a REAL toggle —
  it subscribes/unsubscribes to Web Push via usePushNotifications().
*/
export function SettingsList() {
  const { t, lang, selectedLang, setLanguage } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const [locationOn, setLocationOn] = useState(true)
  const push = usePushNotifications()

  const pushBlocked = push.permission === 'denied'
  const pushUnavailable = !push.supported || (!push.standalone && isIos())
  const pushHint = pushBlocked
    ? t.profile.notificationsBlocked
    : pushUnavailable
      ? t.profile.notificationsInstall
      : null

  const onTogglePush = () => {
    if (pushUnavailable || pushBlocked) return
    if (push.enabled) push.disable()
    else push.enable()
  }

  return (
    <>
      <div className="rounded-[20px] border border-line bg-surface px-[18px] shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        {/* Language — opens the picker sheet */}
        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className="flex w-full items-center gap-3 border-b border-line py-[14px] text-left"
        >
          <span className="w-[22px] text-base">🌐</span>
          <span className="flex-1 text-sm font-semibold text-content">{t.profile.language}</span>
          <span className="mr-2 text-[13px] font-semibold text-muted">{LANG_LABELS[lang]}</span>
          <Chevron />
        </button>

        {/* Location sharing — visual toggle (real behavior is a privacy guardrail) */}
        <div className="flex items-center gap-3 border-b border-line py-[14px]">
          <span className="w-[22px] text-base">📡</span>
          <span className="flex-1 text-sm font-semibold text-content">
            {t.profile.locationSharing}
          </span>
          <Switch on={locationOn} label={t.profile.locationSharing} onClick={() => setLocationOn((v) => !v)} />
        </div>

        {/* Notifications — REAL Web Push toggle */}
        <div className="py-[14px]">
          <div className="flex items-center gap-3">
            <span className="w-[22px] text-base">🔔</span>
            <span className="flex-1 text-sm font-semibold text-content">
              {t.profile.notifications}
            </span>
            <Switch
              on={push.enabled}
              disabled={pushUnavailable || pushBlocked}
              label={t.profile.notifications}
              onClick={onTogglePush}
            />
          </div>
          {pushHint && <p className="mt-1.5 pl-[34px] text-xs text-muted">{pushHint}</p>}
        </div>
      </div>

      <LanguageSheet
        open={langOpen}
        selected={selectedLang}
        onSelect={setLanguage}
        onClose={() => setLangOpen(false)}
      />
    </>
  )
}

// iOS detection (Safari on iPhone/iPad) — used only to show the "install first" hint.
function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function Switch({
  on,
  onClick,
  label,
  disabled = false,
}: {
  on: boolean
  onClick: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${
        on ? 'bg-pine' : 'bg-line'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${
          on ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-line"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
```

- [ ] **Step 2b: Update `ProfileScreen.tsx`**

Remove `goNotifications` from the `useCamp()` destructure and drop the `onNotifications` prop on `<SettingsList />`:
- Change `const { sos, goAnnouncements, goNotifications, logout } = useCamp()` → `const { sos, goAnnouncements, logout } = useCamp()`
- Change `<SettingsList onNotifications={goNotifications} />` → `<SettingsList />`

- [ ] **Step 3: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors (the removed `2`-badge hex `#3a2807` and unused `goNotifications` are gone).

- [ ] **Step 4: Verify the toggle end-to-end**

Run: `npm run dev`, open `http://localhost:5173/camp/profile`.
- Toggle **on** → browser permission prompt appears → **Allow** → switch stays on. DevTools → Application → Service Workers shows a push **subscription** exists (or no error).
- Reload → switch **remembers** it is on (persisted).
- Toggle **off** → subscription removed.
- In a Chrome window with notifications blocked for the site → switch is disabled and the "browser settings" hint shows.
Expected: all true.

- [ ] **Step 5: Commit** (only with the user's go-ahead)

```bash
git add src/components/participant/profile/SettingsList.tsx src/components/participant/profile/ProfileScreen.tsx src/i18n/translations.ts
git commit -m "feat(push): real notifications toggle in profile; drop fake badge"
```

---

### Task 8: Remove the dead notifications route

Complete the merge decision: bell → Announcements is the only "notifications" surface. Remove the orphaned route and its navigation helper.

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/participant/campContext.ts`
- Modify: `src/components/participant/ParticipantDashboard.tsx`

**Interfaces:**
- Consumes: nothing new. Removes `goNotifications` from `CampContext` (already unused after Task 7).

- [ ] **Step 1: Remove the route from `src/App.tsx`**

Delete the notifications route line:
```tsx
<Route path="notifications" element={<ComingSoonRoute titleKey="notifications" />} />
```
Then narrow `ComingSoonRoute` to only `map`:
- `titleKey: { titleKey: 'map' }` → the param type becomes `'map'`.
- Remove the `notifications: t.profile.notifications` entry from the `titles` map.
- Since only `map` remains, simplify: `const isTab = true` and `title={t.nav.map}`. Resulting component:

```tsx
function ComingSoonRoute({ titleKey }: { titleKey: 'map' }) {
  const { t } = useTranslation()
  void titleKey
  return <ComingSoon title={t.nav.map} />
}
```

- [ ] **Step 2: Remove `goNotifications` from `campContext.ts`**

Delete the `goNotifications: () => void` line from the `CampContext` type.

- [ ] **Step 3: Remove `goNotifications` from `ParticipantDashboard.tsx`**

Delete the `goNotifications: () => navigate('/camp/notifications'),` line from the `ctx` object.

- [ ] **Step 4: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: no errors, no unused symbols.

- [ ] **Step 5: Verify no dead links**

Run: `npm run dev`. Navigate to `/camp/notifications` directly in the URL bar.
Expected: the catch-all route redirects to `/` (no crash, no blank screen). The Profile screen has no broken link; the home bell still opens `/camp/announcements`.

- [ ] **Step 6: Full validate + build**

Run: `npm run validate && npm run build`
Expected: lint + format:check + typecheck pass, and the production build (with the service worker) succeeds.

- [ ] **Step 7: Commit** (only with the user's go-ahead)

```bash
git add src/App.tsx src/components/participant/campContext.ts src/components/participant/ParticipantDashboard.tsx
git commit -m "chore(nav): remove dead /camp/notifications route (merged into announcements)"
```

---

## Notes for the implementer

- **iOS reality check:** to truly verify closed-app push on iPhone you must (1) serve over HTTPS, (2) install the PWA to the home screen, (3) allow notifications, (4) send from a real backend. In dev, the DevTools "Push" tester (Task 2, Step 3) is the closest local proxy.
- **The one seam:** `push.service.ts` is the only stub. When the backend ships `POST/DELETE /api/push/subscribe`, uncomment the axios lines and delete the `void x; return Promise.resolve()` placeholders — nothing else changes.
- **Format touched files** preserving line endings: `npx prettier --write --end-of-line auto <files>` (see the CRLF caveat in `CLAUDE.md`).
