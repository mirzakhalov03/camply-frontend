import { axiosInstance } from '../axiosInstance'

/*
  The push SERVICE — the backend boundary for storing a device's subscription.

  Contract:
    POST   /push/subscribe   { subscription }   -> 201
    DELETE /push/subscribe   { endpoint }        -> 204
*/

export type RegisterSubscriptionRequest = { subscription: PushSubscriptionJSON }
export type UnregisterSubscriptionRequest = { endpoint: string }

export const pushService = {
  registerSubscription: async (subscription: PushSubscriptionJSON): Promise<void> => {
    await axiosInstance.post('/push/subscribe', { subscription })
  },

  unregisterSubscription: async (endpoint: string): Promise<void> => {
    await axiosInstance.delete('/push/subscribe', { data: { endpoint } })
  },
}
