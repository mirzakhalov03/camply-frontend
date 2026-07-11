import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, type AuthRole } from '../../store/useAuthStore'

// Higher rank = more authority (mirrors the backend's role hierarchy).
const RANK: Record<AuthRole, number> = { participant: 1, organizer: 2, organization: 3 }

type Props = {
  /** Minimum role required. Defaults to participant (any authenticated user). */
  minRole?: AuthRole
  /** Require a completed profile (the participant camp routes). */
  requireProfile?: boolean
}

/*
  A UX redirect, NOT a security boundary — the backend enforces the real thing on
  every call. Renders the nested routes when the cached identity satisfies the
  requirement; otherwise sends the user back to onboarding.
*/
export function RequireAuth({ minRole = 'participant', requireProfile = false }: Props) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/" replace />
  if (RANK[user.role] < RANK[minRole]) return <Navigate to="/" replace />
  if (requireProfile && !user.profileComplete) return <Navigate to="/" replace />
  return <Outlet />
}
