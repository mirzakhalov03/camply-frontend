import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useCampHome } from '../../lib/campHome'
import { HomeScreen } from './HomeScreen'
import { ComingSoon } from './ComingSoon'
import { BottomNav, type ParticipantTab } from './BottomNav'
import { ProfileScreen } from './profile/ProfileScreen'
import { ChatScreen } from './chat/ChatScreen'
import { RanksScreen } from './ranks/RanksScreen'
import { SosButton } from './sos/SosButton'
import { SosSheet } from './sos/SosSheet'
import { useSos } from './sos/useSos'

type Props = {
  /** Clear the profile and return to the login screen. */
  onLogout: () => void
}

// Secondary destinations reachable from Home/Profile that aren't bottom-nav tabs.
type SoonView = 'schedule' | 'announcements' | 'notifications'

/*
  The participant app shell — everything a camper sees after "Enter the camp".
  It owns navigation with plain `useState` (no router yet): `tab` is the active
  bottom-nav tab, and `soon` is a secondary destination (schedule, announcements)
  that isn't a tab but still needs to go *somewhere*. Home is real; the other
  tabs render ComingSoon. The SOS button + sheet live here so they persist across
  every screen, exactly as the design requires.
*/
export function ParticipantDashboard({ onLogout }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ParticipantTab>('home')
  const [soon, setSoon] = useState<SoonView | null>(null)
  // Once the participant opens Chat, the unread badge is cleared (they've "read"
  // it). Real read-state is server-owned; this is the client stand-in until then.
  const [chatSeen, setChatSeen] = useState(false)
  const sos = useSos()
  // Same cached query HomeScreen uses — here just for the Chat tab's unread badge.
  const { data: home } = useCampHome()

  const goTab = (next: ParticipantTab) => {
    setSoon(null)
    setTab(next)
    if (next === 'chat') setChatSeen(true)
  }

  // Show the unread count until Chat has been opened, then hide it.
  const chatBadge = chatSeen ? undefined : home?.unreadChat

  // Titles resolved at render (not stored in state) so they stay reactive to the
  // active language. `soon` holds a stable key; the label is looked up here.
  const tabTitles: Record<ParticipantTab, string> = {
    home: t.nav.home,
    map: t.nav.map,
    ranks: t.nav.ranks,
    chat: t.nav.chat,
    profile: t.nav.profile,
  }
  const soonTitles: Record<SoonView, string> = {
    schedule: t.home.todaySchedule,
    announcements: t.home.latestAnnouncement,
    notifications: t.profile.notifications,
  }

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-canvas">
      <main className="min-h-0 flex-1">
        {soon ? (
          <ComingSoon title={soonTitles[soon]} onBack={() => setSoon(null)} />
        ) : tab === 'home' ? (
          <HomeScreen
            onOpenSchedule={() => setSoon('schedule')}
            onOpenAnnouncements={() => setSoon('announcements')}
            onOpenGroup={() => goTab('chat')}
          />
        ) : tab === 'profile' ? (
          <ProfileScreen
            sos={sos}
            onNotifications={() => setSoon('notifications')}
            onLogout={onLogout}
          />
        ) : tab === 'chat' ? (
          <ChatScreen />
        ) : tab === 'ranks' ? (
          <RanksScreen />
        ) : (
          <ComingSoon title={tabTitles[tab]} />
        )}
      </main>

      {/* Floating SOS button — Home only (per request). Profile has its own
          "Send help request" card; Map/Ranks/Chat don't show it. The sheet stays
          mounted so an active alert can still resolve from anywhere. */}
      {tab === 'home' && <SosButton helpActive={sos.helpActive} onOpen={sos.open} />}
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

      <BottomNav active={tab} onSelect={goTab} chatBadge={chatBadge} />
    </div>
  )
}
