import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCampHome } from '../../lib/campHome'
import { useProfileStore } from '../../store/useProfileStore'
import { BottomNav } from './BottomNav'
import { SosButton } from './sos/SosButton'
import { SosSheet } from './sos/SosSheet'
import { useSos } from './sos/useSos'
import type { CampContext } from './campContext'

/*
  The participant app shell — the layout for every `/camp/*` route. Renders the
  active screen through <Outlet>, plus the persistent chrome: the floating SOS
  button (Home only), the always-mounted SOS sheet (so a live alert can resolve
  from anywhere), and the bottom nav. Navigation is now real URLs, so push
  notifications can deep-link straight to a screen.
*/
export function ParticipantDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const sos = useSos()
  const resetProfile = useProfileStore((s) => s.reset)
  const phone = useProfileStore((s) => s.phone)
  // Same cached query HomeScreen uses — here just for the Chat tab's unread badge.
  const { data: home } = useCampHome()

  const onHome = location.pathname === '/camp/home'
  const onChat = location.pathname === '/camp/chat'

  // Opening Chat "reads" it — clear the unread badge. Real read-state is server-
  // owned; this is the client stand-in until then.
  const chatBadge = onChat ? undefined : home?.unreadChat

  // Guard: /camp is post-login. If there's no session (no phone captured at
  // login), bounce back to onboarding instead of showing an empty camp.
  useEffect(() => {
    if (!phone) navigate('/', { replace: true })
  }, [phone, navigate])

  const ctx: CampContext = {
    sos,
    goSchedule: () => navigate('/camp/schedule'),
    goAnnouncements: () => navigate('/camp/announcements'),
    goChat: () => navigate('/camp/chat'),
    logout: () => {
      resetProfile()
      navigate('/', { replace: true })
    },
  }

  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden bg-canvas shadow-sm">
      <main className="min-h-0 flex-1">
        <Outlet context={ctx} />
      </main>

      {/* Floating SOS — Home only. Profile has its own help card; the sheet stays
          mounted so an active alert can still resolve from anywhere. */}
      {onHome && <SosButton helpActive={sos.helpActive} onOpen={sos.open} />}
      <SosSheet
        stage={sos.stage}
        reason={sos.reason}
        holdPct={sos.holdPct}
        etaSec={sos.etaSec}
        onClose={sos.close}
        onPickReason={sos.pickReason}
        onHoldStart={sos.holdStart}
        onHoldEnd={sos.holdEnd}
        onCancelHelp={sos.cancelHelp}
      />

      <BottomNav chatBadge={chatBadge} />
    </div>
  )
}
