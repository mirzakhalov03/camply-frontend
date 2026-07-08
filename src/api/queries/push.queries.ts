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
