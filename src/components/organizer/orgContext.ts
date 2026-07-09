import { useOutletContext } from 'react-router-dom'

/*
  The shell context shared with every routed `/org/*` screen via <Outlet context>.
  Keeps route paths centralized in the shell (OrganizerShell) instead of sprinkled
  across screens — the organizer twin of participant campContext.ts. Kept in its own
  module so the shell file only exports a component (otherwise Fast Refresh breaks).
*/
export type OrgContext = {
  /** Open a camp's detail (slice 2). */
  openCamp: (campId: string) => void
  /** Open a camp's live map (currently a "coming soon" placeholder). */
  openCampMap: (campId: string) => void
  /** Start the create-camp flow (currently a "coming soon" placeholder). */
  openCreate: () => void
  /** Open the Team & co-organizers screen. */
  openTeam: () => void
  /** Clear the session + onboarding stores and return to onboarding. */
  logout: () => void
}

/** Typed accessor so screens read the shell context without re-declaring the type. */
export function useOrg() {
  return useOutletContext<OrgContext>()
}
