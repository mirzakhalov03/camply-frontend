import { useOutletContext } from 'react-router-dom'
import type { useSos } from './sos/useSos'

/*
  The shell context shared with every routed `/camp/*` screen via <Outlet context>.
  The SOS state lives in the shell (one instance) and is shared here with the
  Profile screen's help card and the always-mounted sheet — routes are separate
  components, so context is what keeps them on the SAME state machine. Navigation
  helpers keep route paths centralized in the shell rather than sprinkled across
  screens.

  Kept in its own module (not ParticipantDashboard.tsx) so the shell file only
  exports a component — otherwise React Fast Refresh breaks.
*/
export type CampContext = {
  sos: ReturnType<typeof useSos>
  goSchedule: () => void
  goAnnouncements: () => void
  goChat: () => void
  goNotifications: () => void
  logout: () => void
}

/** Typed accessor so screens read the shell context without re-declaring the type. */
export function useCamp() {
  return useOutletContext<CampContext>()
}
