import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/useAuthStore'
import { authService } from '../../api/services/auth.service'
import { AdminSidebar, AdminBottomNav } from './AdminNav'
import type { AdminContext } from './adminContext'

/*
  The organization admin shell — the layout for every `/admin/*` route, a third
  sibling surface to `/camp` (participant) and `/org` (organizer). Renders the active
  screen through <Outlet> with a desktop/tablet SIDEBAR and a mobile BOTTOM NAV.

  Guard: org-only. The client role is a convenience, never the real permission
  (guardrail: enforce the hierarchy server-side) — with no org session we bounce to
  the org login rather than flash an empty dashboard.

  Logout is a REAL server logout: unlike the mock organizer, the org holds a genuine
  httpOnly cookie, and useCurrentUser revalidates org sessions on boot. A local-only
  clear would leave the cookie alive and sign the admin straight back in on reload —
  so we POST /auth/logout to revoke it, then clear local state.
*/
export function AdminShell() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clear)

  const isOrg = user?.role === 'organization'

  const logout = useMutation({
    mutationFn: authService.logout,
    // Clear locally even if the network call fails — the admin asked to leave.
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      navigate('/admin/login', { replace: true })
    },
  })

  useEffect(() => {
    if (!isOrg) navigate('/admin/login', { replace: true })
  }, [isOrg, navigate])

  // Avoid a flash of the dashboard while the redirect effect runs.
  if (!isOrg) return null

  const ctx: AdminContext = {
    logout: () => logout.mutate(),
  }

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-6xl overflow-hidden bg-canvas shadow-sm">
      <AdminSidebar onLogout={ctx.logout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet context={ctx} />
        </main>
        <AdminBottomNav onLogout={ctx.logout} />
      </div>
    </div>
  )
}
