import { create } from 'zustand'
import type { City } from '@/utils/cities'

/*
  CLIENT state — the participant's OWN profile: the data they enter and can edit,
  which the UI owns until a backend exists. Three things feed it:

    • the registration form → name, surname, city, age, photo, initials
    • the login screen       → phone
    • the profile screen     → email, socials  (filled in LATER, not at signup)

  Server-authored data (tribe, points, group rank) deliberately does NOT live
  here — that belongs to useMembership() (React Query), because the organizer /
  backend owns it, not the user. Keeping the two apart is what makes the backend
  swap painless: this store becomes a `PUT /me`, membership becomes a `GET`.

  When the backend lands, the setters below are the single place to also fire the
  mutation — nothing else in the UI changes.
*/

export type Socials = {
  telegram: string
  instagram: string
  facebook: string
  linkedin: string
}

// Exactly what the registration form commits on submit (mirrors ProfileData).
export type Registration = {
  name: string
  surname: string
  city: City
  age: number
  photo: string | null
  initials: string
}

type ProfileState = {
  name: string
  surname: string
  city: City | null
  age: number
  photo: string | null
  initials: string
  phone: string // national digits only (e.g. '901234567'); formatted for display
  email: string
  socials: Socials

  /** Commit the whole identity from the registration form (on submit). */
  setRegistration: (data: Registration) => void
  /** National phone digits, captured at login. */
  setPhone: (phone: string) => void
  /** Change the avatar photo from the profile screen. */
  setPhoto: (photo: string | null) => void
  setEmail: (email: string) => void
  setSocials: (socials: Socials) => void
  /** Wipe everything on log out. */
  reset: () => void
}

const EMPTY_SOCIALS: Socials = { telegram: '', instagram: '', facebook: '', linkedin: '' }

const INITIAL = {
  name: '',
  surname: '',
  city: null as City | null,
  age: 0,
  photo: null as string | null,
  initials: '',
  phone: '',
  email: '',
  socials: EMPTY_SOCIALS,
}

export const useProfileStore = create<ProfileState>((set) => ({
  ...INITIAL,
  setRegistration: ({ name, surname, city, age, photo, initials }) =>
    set({ name, surname, city, age, photo, initials }),
  setPhone: (phone) => set({ phone }),
  setPhoto: (photo) => set({ photo }),
  setEmail: (email) => set({ email }),
  setSocials: (socials) => set({ socials }),
  reset: () => set(INITIAL),
}))
