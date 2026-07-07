import { create } from 'zustand'

/*
  CLIENT state for the participant's OWN group identity — currently just a locally
  chosen group photo. It lives in its own store (not useChatStore) because a
  group's photo is GROUP identity, shared across features: it's uploaded in the
  chat header and shown again on the Ranks screen. Keeping it here means neither
  feature reaches into the other's store — both depend on this shared seam.

  This is the write-side that becomes an API call when the backend lands:
    • setPhoto → PUT /groups/:id/photo
  Until then it's optimistic and local (a browser object URL), and it persists
  across tab switches because the store outlives any single screen.
*/
type GroupState = {
  /** Locally uploaded photo for my group (object URL); null until set. */
  photo: string | null
  setPhoto: (file: File) => void
  reset: () => void
}

export const useGroupStore = create<GroupState>((set) => ({
  photo: null,
  // Revoke the previous object URL before replacing it so repeated uploads don't
  // leak blob: URLs for the lifetime of the tab.
  setPhoto: (file) =>
    set((s) => {
      if (s.photo) URL.revokeObjectURL(s.photo)
      return { photo: URL.createObjectURL(file) }
    }),
  reset: () =>
    set((s) => {
      if (s.photo) URL.revokeObjectURL(s.photo)
      return { photo: null }
    }),
}))
