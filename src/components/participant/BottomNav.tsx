import type { ReactNode } from 'react'
import { useTranslation } from '../../i18n/useTranslation'

// The five participant tabs. Only 'home' is built; the rest show ComingSoon.
export type ParticipantTab = 'home' | 'map' | 'ranks' | 'chat' | 'profile'

type Props = {
  active: ParticipantTab
  onSelect: (tab: ParticipantTab) => void
  /** Unread group-chat count for the Chat badge (server data). */
  chatBadge?: number
}

/*
  Persistent bottom tab bar. Frosted surface so content scrolls under it. The
  active tab is pine; the rest are muted. Chat carries an unread badge. Extra
  bottom padding leaves room for the phone's home indicator (safe area).
*/
export function BottomNav({ active, onSelect, chatBadge }: Props) {
  const { t } = useTranslation()

  const tabs: { id: ParticipantTab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'home', label: t.nav.home, icon: <HomeIcon /> },
    { id: 'map', label: t.nav.map, icon: <MapIcon /> },
    { id: 'ranks', label: t.nav.ranks, icon: <RanksIcon /> },
    { id: 'chat', label: t.nav.chat, icon: <ChatIcon />, badge: chatBadge },
    { id: 'profile', label: t.nav.profile, icon: <ProfileIcon /> },
  ]

  return (
    <nav className="flex-none border-t border-line bg-surface-2/95 px-3.5 pb-6 pt-2 backdrop-blur-md">
      <ul className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-1 px-2 py-1 transition ${
                  isActive ? 'text-pine' : 'text-muted'
                }`}
              >
                {tab.icon}
                {tab.badge ? (
                  <span className="absolute right-1 top-[-2px] flex h-3.5 min-w-3.5 items-center justify-center rounded-full border-[1.5px] border-surface-2 bg-amber px-1 text-[9px] font-extrabold text-[#3a2807]">
                    {tab.badge}
                  </span>
                ) : null}
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ── Icons (stroke = currentColor so they inherit the active/muted color) ── */
const svg = 'stroke-current'

function HomeIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={svg}
    >
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  )
}
function MapIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={svg}
    >
      <path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.3" />
    </svg>
  )
}
function RanksIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={svg}
    >
      <rect x="4" y="13" width="4" height="7" rx="1" />
      <rect x="10" y="8" width="4" height="12" rx="1" />
      <rect x="16" y="11" width="4" height="9" rx="1" />
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
      className={svg}
    >
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
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
      className={svg}
    >
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}
