import { useEffect } from 'react'
import {
  getPermission,
  isPushSupported,
  isStandalone,
  requestPermission,
  subscribePush,
  unsubscribePush,
} from './pushClient'
import { usePushStore } from '@/store/usePushStore'
import { useRegisterPush, useUnregisterPush } from '@/api/queries/push.queries'

/*
  The one hook the UI touches for notifications. It orchestrates the browser
  permission + subscription and mirrors the outcome into usePushStore (UI state),
  registering the subscription with the backend via React Query mutations.
*/
export function usePushNotifications() {
  const enabled = usePushStore((s) => s.enabled)
  const permission = usePushStore((s) => s.permission)
  const status = usePushStore((s) => s.status)
  const setEnabled = usePushStore((s) => s.setEnabled)
  const setPermission = usePushStore((s) => s.setPermission)
  const setStatus = usePushStore((s) => s.setStatus)
  const register = useRegisterPush()
  const unregister = useUnregisterPush()
  const supported = isPushSupported()

  // On mount, reconcile the persisted preference with live browser state. Reads
  // through getState() so the effect has no changing deps and runs once.
  useEffect(() => {
    const store = usePushStore.getState()
    if (!isPushSupported()) {
      store.setStatus('unsupported')
      return
    }
    const current = getPermission()
    store.setPermission(current)
    if (current === 'denied') store.setStatus('denied')
    else if (store.enabled && current === 'granted') store.setStatus('subscribed')
    else store.setStatus('idle')
  }, [])

  // enable/disable fully contain their own errors: the UI calls them
  // fire-and-forget from an onClick, so they must never reject.
  async function enable() {
    if (!supported) return
    setStatus('subscribing')
    try {
      const result = await requestPermission()
      setPermission(result)
      if (result !== 'granted') {
        setEnabled(false)
        setStatus(result === 'denied' ? 'denied' : 'idle')
        return
      }
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
    } catch {
      // Ignore — we disable locally regardless so the UI can't get stuck "on".
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
