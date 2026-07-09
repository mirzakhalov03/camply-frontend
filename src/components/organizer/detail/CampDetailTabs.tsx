import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'

/*
  The camp-detail tab bar. Each tab is a NavLink to a real nested route
  (`/org/camps/:id/participants` …) so tabs are deep-linkable — a push like "SOS in
  camp X" can open straight to the Map tab. Horizontally scrollable on narrow
  phones; the active tab is a pine pill, driven by the URL.
*/
export function CampDetailTabs() {
  const { t } = useTranslation()
  const d = t.org.detail
  const tabs = [
    { to: 'participants', label: d.tabParticipants },
    { to: 'groups', label: d.tabGroups },
    { to: 'map', label: d.tabMap },
    { to: 'leaderboard', label: d.tabLeaderboard },
    { to: 'schedule', label: d.tabSchedule },
    { to: 'announcements', label: d.tabAnnouncements },
  ]

  return (
    <div className="flex gap-1.5 overflow-x-auto px-5 pb-1 pt-4 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex-none rounded-full px-3.5 py-2 text-body font-semibold transition ${
              isActive ? 'bg-pine text-white' : 'bg-surface text-muted hover:text-content'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
