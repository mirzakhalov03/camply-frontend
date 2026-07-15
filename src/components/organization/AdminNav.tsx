import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'

/*
  Organization admin navigation, in TWO responsive forms from one item list:
    • AdminBottomNav — mobile tab bar
    • AdminSidebar   — a real desktop/tablet rail (md+), a stated deliverable

  Both use NavLink to real `/admin/*` routes, so active state is URL-driven. One
  destination today (Organizers); the list is structured so Camps/Participants slot
  in later. Logout lives in the shell (real cookie session) and is passed in, since
  the nav renders outside the Outlet and can't read the admin context.
*/

type NavItem = { to: string; label: string; icon: ReactNode }

function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  return [
    { to: '/admin/camps', label: t.admin.nav.camps, icon: <CampsIcon /> },
    { to: '/admin/managers', label: t.admin.nav.managers, icon: <ManagerIcon /> },
    { to: '/admin/team', label: t.admin.nav.team, icon: <TeamIcon /> },
    { to: '/admin/profile', label: t.admin.nav.profile, icon: <ProfileIcon /> },
  ]
}

/* ── Mobile: bottom tab bar (hidden from md up) ─────────────────────────── */
export function AdminBottomNav({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation()
  const items = useNavItems()
  return (
    <nav className="flex-none border-t border-line bg-surface-2/95 px-3.5 pb-6 pt-2 backdrop-blur-md md:hidden">
      <ul className="flex items-center justify-around">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1 transition ${
                  isActive ? 'text-pine' : 'text-muted'
                }`
              }
            >
              {item.icon}
              <span className="text-meta font-semibold">{item.label}</span>
            </NavLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center gap-1 px-2 py-1 text-muted transition active:scale-95"
          >
            <LogoutIcon />
            <span className="text-meta font-semibold">{t.admin.nav.logout}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

/* ── Desktop/tablet: left rail (md and up) ─────────────────────────────── */
export function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation()
  const items = useNavItems()

  return (
    <aside className="hidden w-60 flex-none flex-col border-r border-line bg-surface-2 md:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <img src="/pwa-192x192.png" alt="Camply" className="h-9 w-9 flex-none rounded-input" />
        <div className="min-w-0">
          <div className="truncate text-title font-bold text-content">Camply</div>
          <div className="text-meta text-muted">Organization</div>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-input px-3 py-2.5 text-title font-semibold transition ${
                  isActive
                    ? 'bg-green-tint text-pine'
                    : 'text-muted hover:bg-soft hover:text-content'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="px-3 pb-6">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-input px-3 py-2.5 text-title font-semibold text-muted transition hover:bg-soft hover:text-content"
        >
          <LogoutIcon />
          <span>{t.admin.nav.logout}</span>
        </button>
      </div>
    </aside>
  )
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
const icon = 'stroke-current flex-none'
function CampsIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={icon}
    >
      {/* 2×2 grid of rounded tiles — the "all camps" overview glyph. */}
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  )
}
function ManagerIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={icon}
    >
      {/* A single lead figure with a star badge — the camp owner (PM). */}
      <circle cx="10" cy="8" r="3.4" />
      <path d="M4 20v-1.2a6 6 0 0 1 12 0V20" />
      <path d="m19 3 1.1 2.2 2.4.35-1.75 1.7.42 2.4L19 8.5l-2.17 1.15.42-2.4-1.75-1.7 2.4-.35z" />
    </svg>
  )
}
function TeamIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={icon}
    >
      {/* Group of three — big figure in front, two smaller ones behind. */}
      <circle cx="12" cy="7" r="3.1" />
      <path d="M6.8 20v-1.4a5.2 5.2 0 0 1 10.4 0V20" />
      <circle cx="5" cy="9" r="2.3" />
      <path d="M1.6 19v-1.1a4 4 0 0 1 3.9-4" />
      <circle cx="19" cy="9" r="2.3" />
      <path d="M22.4 19v-1.1a4 4 0 0 0-3.9-4" />
    </svg>
  )
}
function ProfileIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={icon}
    >
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={icon}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}
