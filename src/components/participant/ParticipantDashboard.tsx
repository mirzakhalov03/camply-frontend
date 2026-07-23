import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { connectRealtime, disconnectRealtime } from '../../api/realtime/realtimeBridge'
import { useChatUnreadStore } from '../../store/useChatUnreadStore'
import { useLanguageSync } from '@/hooks/useLanguageSync'
import { useMyCamps } from '../../api/queries/me.queries'
import { useLogout } from '../../api/queries/auth.queries'
import { NoCampScreen } from './NoCampScreen'
import { HomeSkeleton } from './HomeSkeleton'
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
  const logout = useLogout()
  useLanguageSync() // keep the server's language in sync for push localization

  /*
    Resolve the camp ONCE, here — the single component wrapping every /camp/* route.
    Screens then read a guaranteed campId from context instead of each handling its
    absence. One active camp for now; the payload is list-shaped (server orders it
    running-now first, then soonest upcoming) so a switcher is later UI-only work.
  */
  const { data: camps, isPending } = useMyCamps()
  const camp = camps?.[0]

  // Live unread total, driven by the socket (seeded on connect, bumped per message,
  // cleared when the thread opens). Replaces the old mock home.unreadChat.
  const unreadTotal = useChatUnreadStore((s) => s.total())

  // Open the single realtime socket once the camp resolves; close on leave. Chat
  // messages route from here into the query cache (see realtimeBridge).
  useEffect(() => {
    if (!camp?.id) return
    connectRealtime(camp.id)
    return () => disconnectRealtime()
  }, [camp?.id])

  const onHome = location.pathname === '/camp/home'
  const onChat = location.pathname === '/camp/chat'

  // Opening Chat clears its rooms' counts (see ChatScreen); hide the badge there too.
  const chatBadge = onChat ? undefined : unreadTotal || undefined

  // Gate on resolution so every screen below can treat campId as non-null.
  if (isPending || !camp) {
    return (
      <div className="relative mx-auto flex h-dvh w-full max-w-2xl flex-col overflow-hidden bg-canvas shadow-sm">
        {/* No bottom nav, no SOS in the no-camp state: nothing to navigate
            within, and no camp organizer to signal. */}
        {isPending ? <HomeSkeleton /> : <NoCampScreen />}
      </div>
    )
  }

  const ctx: CampContext = {
    campId: camp.id,
    sos,
    goSchedule: () => navigate('/camp/schedule'),
    goAnnouncements: () => navigate('/camp/announcements'),
    goChat: () => navigate('/camp/chat'),
    logout: () => logout.mutate(),
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
