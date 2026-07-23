import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'
import { useChatUnreadStore } from '../../store/useChatUnreadStore'

/*
  Organizer navigation, rendered in TWO responsive forms from one item list:
    • OrganizerBottomNav — mobile tab bar (organizers are mostly on their phone)
    • OrganizerSidebar   — a real desktop/tablet rail (md+), a stated deliverable

  Both use NavLink to real `/org/*` routes, so the active state is driven by the URL
  and push-notification deep links highlight the right destination for free. The
  Chat unread badge reads the shared summary query (deduped with the dashboard).
*/

type NavItem = { to: string; label: string; icon: ReactNode; badge?: number }

function useNavItems(): NavItem[] {
  const { t } = useTranslation()
  // Live unread total from the socket (seeded on connect, bumped per message, cleared
  // on thread open) — replaces the mock summary.unreadChat.
  const unreadTotal = useChatUnreadStore((s) => s.total())
  return [
    { to: '/org/camps', label: t.org.nav.main, icon: <CampsIcon /> },
    // Team is the camp's ORGANIZER-tier roster (participants live inside a camp's
    // detail screen) — a destination in its own right, not a profile setting.
    { to: '/org/team', label: t.org.nav.team, icon: <TeamIcon /> },
    { to: '/org/chat', label: t.org.nav.chat, icon: <ChatIcon />, badge: unreadTotal || undefined },
    { to: '/org/profile', label: t.org.nav.profile, icon: <ProfileIcon /> },
  ]
}

/* ── Mobile: bottom tab bar (hidden from md up) ─────────────────────────── */
export function OrganizerBottomNav() {
  const items = useNavItems()
  return (
    <nav className="flex-none border-t border-line bg-surface-2/95 px-3.5 pb-6 pt-2 backdrop-blur-md md:hidden">
      <ul className="flex items-center justify-around">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 px-2 py-1 transition ${
                  isActive ? 'text-pine' : 'text-muted'
                }`
              }
            >
              {item.icon}
              {item.badge ? <Dot count={item.badge} className="right-1 top-[-2px]" /> : null}
              <span className="text-meta font-semibold">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ── Desktop/tablet: left rail (md and up) ─────────────────────────────── */
export function OrganizerSidebar() {
  const items = useNavItems()

  return (
    <aside className="hidden w-60 flex-none flex-col border-r border-line bg-surface-2 md:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <img src="/pwa-192x192.png" alt="Camply" className="h-9 w-9 flex-none rounded-input" />
        <div className="min-w-0">
          <div className="truncate text-title font-bold text-content">Camply</div>
          <div className="text-meta text-muted">Organizer</div>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-input px-3 py-2.5 text-title font-semibold transition ${
                  isActive
                    ? 'bg-green-tint text-pine'
                    : 'text-muted hover:bg-soft hover:text-content'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? <Dot count={item.badge} className="right-3 top-2.5" /> : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}

/* ── Shared bits ───────────────────────────────────────────────────────── */
function Dot({ count, className = '' }: { count: number; className?: string }) {
  return (
    <span
      className={`absolute flex h-3.5 min-w-3.5 items-center justify-center rounded-full border-[1.5px] border-surface-2 bg-amber-bright px-1 text-[9px] font-extrabold text-amber-ink ${className}`}
    >
      {count}
    </span>
  )
}

const icon = 'stroke-current flex-none'
function CampsIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" strokeWidth="2.1" className={icon}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
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
      <circle cx="9" cy="8" r="3.3" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16.5 5.2a3.3 3.3 0 0 1 0 5.6M18 14.4a6.5 6.5 0 0 1 3.5 5.6" />
    </svg>
  )
}
function ChatIcon() {
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
      <path d="M20 6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2v4l4-4h6a2 2 0 0 0 2-2z" />
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
