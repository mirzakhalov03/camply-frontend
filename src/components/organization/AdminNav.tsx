import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'
import { CamplyMark } from '../ui'

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
    { to: '/admin/dashboard', label: t.admin.nav.dashboard, icon: <DashboardIcon /> },
    { to: '/admin/camps', label: t.admin.nav.camps, icon: <CampsIcon /> },
    { to: '/admin/organizers', label: t.admin.nav.organizers, icon: <OrganizersIcon /> },
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
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-pine text-white">
          <CamplyMark variant="mono" className="w-5" title="Camply" />
        </span>
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
function DashboardIcon() {
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
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}
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
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 4v16" />
    </svg>
  )
}
function OrganizersIcon() {
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
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M17 4.2a3.4 3.4 0 0 1 0 6.6" />
      <path d="M18.5 14.3A6.5 6.5 0 0 1 21.5 20" />
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
