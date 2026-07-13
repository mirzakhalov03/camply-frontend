import { useTranslation } from '../../../i18n/useTranslation'
import { useThemeStore } from '../../../store/useThemeStore'
import { interpolate } from '@/utils/interpolate'
import type { CampHome } from '../../../lib/campHome'

type Props = {
  /** Camp identity — supplied by the organizer's data (via useCampHome). */
  camp: CampHome['camp']
  /** Open the notifications / announcements screen (bell tap). */
  onOpenNotifications: () => void
  /** Unread announcements — drives the bell badge. */
  unreadCount?: number
}

/*
  The camp banner at the top of Home. Presentational: it renders whatever `camp`
  it's handed (mock today, organizer-created later). The deep-green dawn gradient
  with a mountain silhouette stays vivid in both light and dark mode. Floating
  over it: the notifications bell and the light/dark toggle.
*/
export function CampCover({ camp, onOpenNotifications, unreadCount = 0 }: Props) {
  const { t } = useTranslation()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const isDark = theme === 'dark'

  return (
    <div className="relative h-52 flex-none overflow-hidden bg-[linear-gradient(160deg,#0f6b4f_0%,#0a5039_55%,#083b2b_100%)]">
      {/* Cover photo. Inline style because the URL is runtime data (organizer
          upload later); the green gradient behind it shows if the image fails. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${camp.coverImage})` }}
      />
      {/* Bottom scrim so white text stays legible over any photo. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,40,28,0.15)_0%,rgba(8,40,28,0.85)_100%)]" />

      {/* Floating controls: bell + theme toggle. */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-md backdrop-blur-md transition hover:bg-white/25"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-deep bg-amber px-1 text-[10px] font-bold leading-none text-amber-ink">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          aria-pressed={isDark}
          className="relative flex h-8 w-[62px] items-center justify-between rounded-full border border-white/35 bg-white/15 px-2 shadow-md backdrop-blur-md"
        >
          <span className="text-[11px] leading-none opacity-85">☀️</span>
          <span className="text-[11px] leading-none opacity-85">🌙</span>
          <span
            className={`absolute top-[3px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[13px] shadow transition-[left] duration-300 ${
              isDark ? 'left-[33px]' : 'left-[3px]'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.45,0.5,1)' }}
          >
            {isDark ? '🌙' : '☀️'}
          </span>
        </button>
      </div>

      {/* Camp identity. */}
      <div className="absolute inset-x-5 bottom-5 text-white">
        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-amber/95 px-2.5 py-1 text-[11px] font-bold text-[#3a2807]">
          <span className="h-[7px] w-[7px] animate-livedot rounded-full bg-[#3a2807]" />
          {interpolate(t.home.dayProgress, {
            current: camp.dayCurrent,
            total: camp.dayTotal,
          })}{' '}
          · {t.home.liveNow}
        </div>
        <h1 className="font-display text-[23px] font-bold leading-tight tracking-tight">
          {camp.name}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/80">
          📍 {camp.location} · {camp.dateRange}
        </p>
      </div>
    </div>
  )
}
