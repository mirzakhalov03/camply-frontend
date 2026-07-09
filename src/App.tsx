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
import { OrganizerShell } from './components/organizer/OrganizerShell'
import { CampsScreen } from './components/organizer/camps/CampsScreen'
import { CampDetailShell } from './components/organizer/detail/CampDetailShell'
import { ParticipantsTab } from './components/organizer/detail/participants/ParticipantsTab'
import { GroupsTab } from './components/organizer/detail/groups/GroupsTab'
import { LeaderboardTab } from './components/organizer/detail/leaderboard/LeaderboardTab'
import { ScheduleTab } from './components/organizer/detail/schedule/ScheduleTab'
import { AnnouncementsTab } from './components/organizer/detail/announcements/AnnouncementsTab'
import { OrgChatScreen } from './components/organizer/chat/OrgChatScreen'
import { OrgProfileScreen } from './components/organizer/profile/OrgProfileScreen'
import { OrgTeamScreen } from './components/organizer/team/OrgTeamScreen'
import { OrgComingSoon } from './components/organizer/OrgComingSoon'
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

      {/*
        Organizer surface (slice 1: shell + camps dashboard). Chat, Profile, the
        Map tab, and Camp Detail are real routes today so nav + deep links resolve;
        each lands a "coming soon" until its slice. `camps/new` precedes
        `camps/:campId` so "new" isn't captured as a camp id.
      */}
      <Route path="/org" element={<OrganizerShell />}>
        <Route index element={<Navigate to="camps" replace />} />
        <Route path="camps" element={<CampsScreen />} />
        <Route path="camps/new" element={<OrgComingSoon />} />
        {/* Camp Detail (slice 2): tabbed layout, each tab a deep-linkable route.
            Participants + Groups are built; the rest land a "coming soon". */}
        <Route path="camps/:campId" element={<CampDetailShell />}>
          <Route index element={<Navigate to="participants" replace />} />
          <Route path="participants" element={<ParticipantsTab />} />
          <Route path="groups" element={<GroupsTab />} />
          <Route path="map" element={<OrgComingSoon />} />
          <Route path="leaderboard" element={<LeaderboardTab />} />
          <Route path="schedule" element={<ScheduleTab />} />
          <Route path="announcements" element={<AnnouncementsTab />} />
        </Route>
        <Route path="chat" element={<OrgChatScreen />} />
        <Route path="profile" element={<OrgProfileScreen />} />
        <Route path="team" element={<OrgTeamScreen />} />
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
