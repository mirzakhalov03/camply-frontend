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
