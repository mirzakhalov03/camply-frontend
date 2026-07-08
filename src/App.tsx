import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Onboarding } from './components/Onboarding'
import { ParticipantDashboard } from './components/participant/ParticipantDashboard'
import { HomeScreen } from './components/participant/HomeScreen'
import { ChatScreen } from './components/participant/chat/ChatScreen'
import { RanksScreen } from './components/participant/ranks/RanksScreen'
import { ProfileScreen } from './components/participant/profile/ProfileScreen'
import { ComingSoon } from './components/participant/ComingSoon'
import { useTranslation } from './i18n/useTranslation'

/*
  Route table. Two surfaces today: onboarding at `/`, and the participant app at
  `/camp/*` (a layout + one route per screen, so push can deep-link). The
  organizer and organization surfaces will slot in as sibling top-level routes
  (`/org`, `/admin`) — that's why the structure is split by surface here.
*/
function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />

      <Route path="/camp" element={<ParticipantDashboard />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomeScreen />} />
        <Route path="chat" element={<ChatScreen />} />
        <Route path="ranks" element={<RanksScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        {/* Not-yet-built destinations — still real routes so links/pushes resolve. */}
        <Route path="map" element={<ComingSoonRoute titleKey="map" />} />
        <Route path="schedule" element={<ComingSoonRoute titleKey="schedule" />} />
        <Route path="announcements" element={<ComingSoonRoute titleKey="announcements" />} />
        <Route path="notifications" element={<ComingSoonRoute titleKey="notifications" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Adapter: resolves the translated title and a Back handler for placeholder routes.
function ComingSoonRoute({
  titleKey,
}: {
  titleKey: 'map' | 'schedule' | 'announcements' | 'notifications'
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const titles = {
    map: t.nav.map,
    schedule: t.home.todaySchedule,
    announcements: t.home.latestAnnouncement,
    notifications: t.profile.notifications,
  }
  // Tabs (map) have the bottom nav to leave; secondary views get an explicit Back.
  const isTab = titleKey === 'map'
  return <ComingSoon title={titles[titleKey]} onBack={isTab ? undefined : () => navigate(-1)} />
}

export default App
