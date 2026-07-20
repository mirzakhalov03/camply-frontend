import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useProfileStore } from '../../store/useProfileStore'
import { useOrganizerStore } from '../../store/useOrganizerStore'
import { OrganizerSidebar, OrganizerBottomNav } from './OrganizerNav'
import type { OrgContext } from './orgContext'
import { usesOrgSurface } from '@/utils/roles'

/*
  The organizer app shell — the layout for every `/org/*` route, a sibling surface
  to the participant `/camp/*` shell. Renders the active screen through <Outlet>
  with a desktop/tablet SIDEBAR and a mobile BOTTOM NAV (both stay in sync via the
  URL). Navigation helpers are shared down through Outlet context so route paths
  stay centralized here.

  Guard: `/org` is role-gated. The client role is a convenience, never the real
  permission (guardrail: enforce the hierarchy server-side) — but with no organizer
  session we bounce to onboarding rather than show an empty back-office.
*/
export function OrganizerShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clear)
  const resetProfile = useProfileStore((s) => s.reset)
  const resetOrganizer = useOrganizerStore((s) => s.reset)

  // The /org surface is shared by managers (full) and organizers (reduced); the org
  // super-admin can also land here. Capability gating (create camp, invite) is by
  // account role inside the screens — the server is the real authority.
  const canUseOrgSurface = usesOrgSurface(user?.role)

  useEffect(() => {
    if (!canUseOrgSurface) navigate('/', { replace: true })
  }, [canUseOrgSurface, navigate])

  // Every /org screen scrolls inside this one persistent <main> (see below), so its
  // scrollTop carries over across navigation — open a feature after scrolling the
  // launcher and it lands mid-page. Reset to the top on each route change.
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  // Avoid a flash of the back-office while the redirect effect runs.
  if (!canUseOrgSurface) return null

  const ctx: OrgContext = {
    openCamp: (campId) => navigate(`/org/camps/${campId}`),
    openCampMap: (campId) => navigate(`/org/camps/${campId}/map`),
    openChat: () => navigate('/org/chat'),
    openNotifications: () => navigate('/org/notifications'),
    openTeam: () => navigate('/org/team'),
    logout: () => {
      clearAuth()
      resetProfile()
      resetOrganizer()
      navigate('/', { replace: true })
    },
  }

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-6xl overflow-hidden bg-canvas shadow-sm">
      <OrganizerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
          <Outlet context={ctx} />
        </main>
        <OrganizerBottomNav />
      </div>
    </div>
  )
}
