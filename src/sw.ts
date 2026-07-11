/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

// App shell precache (injected by vite-plugin-pwa).
precacheAndRoute(self.__WB_MANIFEST)

type PushPayload = {
  title: string
  body: string
  url: string
  tag?: string
  type?: string
}

// Activate a new build immediately instead of parking it in "waiting" until every
// tab closes — so a single refresh picks up the latest version (no stale cache).
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Take control quickly so a freshly-installed SW can receive pushes.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// A push arrived (the app may be closed). Parse it and show a notification.
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
  const url = (event.notification.data as { url?: string } | null)?.url ?? '/camp/home'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an existing Camply tab and navigate it; else open a new one.
      for (const client of clientList) {
        client.navigate(url)
        return client.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})

// Browsers occasionally rotate the subscription; re-subscribe + re-register so
// pushes don't silently die. Mirrors pushClient.subscribePush() on the client.
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
        // Best-effort; the app re-registers on next launch via the hook.
      }),
  )
})

// VAPID keys are base64url strings; the Push API needs a Uint8Array backed by a
// plain ArrayBuffer (not the generic ArrayBufferLike that a bare Uint8Array infers).
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}
