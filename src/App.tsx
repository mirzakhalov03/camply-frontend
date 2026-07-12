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
import { InviteAccept } from './components/organizer/InviteAccept'
import { OrganizerOnboarding } from './components/organizer/OrganizerOnboarding'
import { CampsScreen } from './components/organizer/camps/CampsScreen'
import { CampDetailShell } from './components/organizer/detail/CampDetailShell'
import { FeatureShell } from './components/organizer/detail/FeatureShell'
import { ParticipantsTab } from './components/organizer/detail/participants/ParticipantsTab'
import { GroupsTab } from './components/organizer/detail/groups/GroupsTab'
import { LeaderboardTab } from './components/organizer/detail/leaderboard/LeaderboardTab'
import { ScheduleTab } from './components/organizer/detail/schedule/ScheduleTab'
import { AnnouncementsTab } from './components/organizer/detail/announcements/AnnouncementsTab'
import { OrgChatScreen } from './components/organizer/chat/OrgChatScreen'
import { OrgProfileScreen } from './components/organizer/profile/OrgProfileScreen'
import { OrgNotificationsScreen } from './components/organizer/notifications/OrgNotificationsScreen'
import { OrgTeamScreen } from './components/organizer/team/OrgTeamScreen'
import { OrgComingSoon } from './components/organizer/OrgComingSoon'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireAdmin } from './components/auth/RequireAdmin'
import { AdminShell } from './components/organization/AdminShell'
import { AdminLogin } from './components/organization/AdminLogin'
import { OrganizersScreen } from './components/organization/organizers/OrganizersScreen'
import { useCurrentUser } from './api/queries/auth.queries'
import { useTranslation } from './i18n/useTranslation'

/*
  Route table. Two surfaces today: onboarding at `/`, and the participant app at
  `/camp/*` (a layout + one route per screen, so push can deep-link). The
  organizer and organization surfaces will slot in as sibling top-level routes
  (`/org`, `/admin`) — that's why the structure is split by surface here.
*/
/* Revalidates the session cookie on load (participant only — see useCurrentUser).
   Renders nothing; the store/interceptor do the syncing. */
function SessionBoot() {
  useCurrentUser()
  return null
}

function App() {
  return (
    <>
      <SessionBoot />
      <Routes>
        <Route path="/" element={<Onboarding />} />

        {/* Public — the emailed organizer magic link lands here, no session yet. */}
        <Route path="/invite/:token" element={<InviteAccept />} />

        <Route element={<RequireAuth requireProfile />}>
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
        </Route>

        {/*
        Organizer surface (slice 1: shell + camps dashboard). Chat, Profile, the
        Map tab, and Camp Detail are real routes today so nav + deep links resolve;
        each lands a "coming soon" until its slice. `camps/new` precedes
        `camps/:campId` so "new" isn't captured as a camp id.
      */}
        {/* Organizer onboarding — reachable by an organizer whose profile is still
            incomplete (fresh off the invite accept), so NOT profile-gated. */}
        <Route element={<RequireAuth minRole="organizer" />}>
          <Route path="/org/welcome" element={<OrganizerOnboarding />} />
        </Route>

        <Route element={<RequireAuth minRole="organizer" requireProfile />}>
          <Route path="/org" element={<OrganizerShell />}>
            <Route index element={<Navigate to="camps" replace />} />
            <Route path="camps" element={<CampsScreen />} />
            {/* Camp Detail: the /org/camps home is the launcher; each feature is a
                deep-linkable route rendered full-screen inside FeatureShell (back arrow
                -> home). URLs are unchanged so push/deep-links still resolve. A bare
                camp URL has no per-camp hub -- redirect it to the home launcher. Map
                lands a "coming soon" for now. */}
            <Route path="camps/:campId" element={<CampDetailShell />}>
              <Route index element={<Navigate to="/org/camps" replace />} />
              <Route
                path="participants"
                element={
                  <FeatureShell featureKey="participants">
                    <ParticipantsTab />
                  </FeatureShell>
                }
              />
              <Route
                path="groups"
                element={
                  <FeatureShell featureKey="groups">
                    <GroupsTab />
                  </FeatureShell>
                }
              />
              <Route
                path="map"
                element={
                  <FeatureShell featureKey="map">
                    <OrgComingSoon />
                  </FeatureShell>
                }
              />
              <Route
                path="leaderboard"
                element={
                  <FeatureShell featureKey="leaderboard">
                    <LeaderboardTab />
                  </FeatureShell>
                }
              />
              <Route
                path="schedule"
                element={
                  <FeatureShell featureKey="schedule">
                    <ScheduleTab />
                  </FeatureShell>
                }
              />
              <Route
                path="announcements"
                element={
                  <FeatureShell featureKey="announcements">
                    <AnnouncementsTab />
                  </FeatureShell>
                }
              />
            </Route>
            <Route path="chat" element={<OrgChatScreen />} />
            <Route path="notifications" element={<OrgNotificationsScreen />} />
            <Route path="profile" element={<OrgProfileScreen />} />
            <Route path="team" element={<OrgTeamScreen />} />
          </Route>
        </Route>

        {/* Organization admin surface — the third surface, org-only. Its own login
            page (no link from the participant landing); the dashboard tree is
            guarded by RequireAdmin (exact role 'organization'). */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Navigate to="organizers" replace />} />
            <Route path="organizers" element={<OrganizersScreen />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

// Adapter: resolves the translated title for the Map placeholder. Map is a tab,
// so it has no Back button — the bottom nav leaves it.
function ComingSoonRoute() {
  const { t } = useTranslation()
  return <ComingSoon title={t.nav.map} />
}

export default App
