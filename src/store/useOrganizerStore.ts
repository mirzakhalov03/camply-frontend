import { create } from 'zustand'
import type { OrganizerRole } from '../components/organizer/roles'
import type { CampGroup } from '../lib/groups'

/*
  CLIENT state — the organizer's OWN identity chosen at onboarding: their role,
  and (coordinators only) the single group they run. The organizer twin of
  useProfileStore, kept separate because that store is the participant's profile;
  role/group is organizer-specific. In-memory (not persisted), same as
  useProfileStore. When the backend lands, setIdentity is the seam where the
  organizer-registration mutation fires — nothing else in the UI changes.
*/
type OrganizerState = {
  role: OrganizerRole | null
  group: CampGroup | null
  /** Commit role + group on profile submit. `group` is null for every role
      except coordinator. */
  setIdentity: (role: OrganizerRole, group: CampGroup | null) => void
  /** Wipe on log out. */
  reset: () => void
}

export const useOrganizerStore = create<OrganizerState>((set) => ({
  role: null,
  group: null,
  setIdentity: (role, group) => set({ role, group }),
  reset: () => set({ role: null, group: null }),
}))
