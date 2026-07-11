/*
  The Web Push API boundary — plain async functions, no React. Everything that
  touches navigator / Notification / PushManager lives here so the rest of the app
  never speaks to the raw browser API. Consumed by usePushNotifications().
*/

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
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
