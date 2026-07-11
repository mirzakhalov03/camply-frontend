import { useOutletContext } from 'react-router-dom'

/*
  The shell context shared with every routed `/admin/*` screen via <Outlet context>.
  The organization twin of orgContext.ts / campContext.ts. Kept in its own module so
  AdminShell only exports a component (otherwise Fast Refresh breaks).
*/
export type AdminContext = {
  /** Revoke the session server-side, clear local state, return to /admin/login. */
  logout: () => void
}

/** Typed accessor so screens read the shell context without re-declaring the type. */
export function useAdmin() {
  return useOutletContext<AdminContext>()
}
