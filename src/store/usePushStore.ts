import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  Client-owned notification state (a UI preference), so it lives in Zustand like
  theme/language — NOT React Query. `enabled` is the toggle and is persisted so
  the choice survives a reload / PWA relaunch. `permission` and `status` describe
  the live browser state and are refreshed from the API on load, so they are not
  persisted.
*/
export type PushStatus = 'idle' | 'unsupported' | 'subscribing' | 'subscribed' | 'denied' | 'error'

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
