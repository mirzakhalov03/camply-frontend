import { Navigate, Route, Routes } from 'react-router-dom'
import { Onboarding } from './components/Onboarding'
import { ParticipantDashboard } from './components/participant/ParticipantDashboard'
import { HomeScreen } from './components/participant/HomeScreen'
import { ChatScreen } from './components/participant/chat/ChatScreen'
import { RanksScreen } from './components/participant/ranks/RanksScreen'
import { ProfileScreen } from './components/participant/profile/ProfileScreen'
import { AnnouncementsScreen } from './components/participant/announcements/AnnouncementsScreen'
import { AnnouncementDetailScreen } from './components/participant/announcements/AnnouncementDetailScreen'
import { ScheduleScreen } from './components/participant/schedule/ScheduleScreen'
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
        <Route path="announcements" element={<AnnouncementsScreen />} />
        <Route path="announcements/:id" element={<AnnouncementDetailScreen />} />
        <Route path="map" element={<ComingSoonRoute />} />
        <Route path="schedule" element={<ScheduleScreen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Adapter: resolves the translated title for the Map placeholder. Map is a tab,
// so it has no Back button — the bottom nav leaves it.
function ComingSoonRoute() {
  const { t } = useTranslation()
  return <ComingSoon title={t.nav.map} />
}

export default App
