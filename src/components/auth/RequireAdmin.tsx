import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

/*
  Org-only guard for the /admin surface. An EXACT-role check (not minRole): an
  organizer must never reach /admin, so we can't reuse the rank-based RequireAuth.
  A UX redirect, NOT security — the backend enforces the real boundary on every call.
*/
export function RequireAdmin() {
  const user = useAuthStore((s) => s.user)
  if (user?.role !== 'organization') return <Navigate to="/admin/login" replace />
  return <Outlet />
}
