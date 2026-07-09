import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { OrganizerSummary } from '../../../api/services/camps.service'

/*
  Two shortcuts into the live-ops surfaces: the Live map (with an on-site / alert
  glance) and the Leaderboard (with who's leading). Both land in later slices for
  now, but the counts are real so the dashboard already feels alive.
*/
export function QuickLinks({
  summary,
  alertCount,
  leaderName,
  onMap,
  onLeaderboard,
}: {
  summary: OrganizerSummary
  /** Live count of active SOS/help requests — from the shared help query, so it
      drops the moment one is resolved anywhere (not the static summary aggregate). */
  alertCount: number
  leaderName: string | null
  onMap: () => void
  onLeaderboard: () => void
}) {
  const { t } = useTranslation()
  const c = t.org.camps
  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        onClick={onMap}
        className="flex-1 rounded-input border border-line bg-surface p-3.5 text-left transition active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-input bg-green-tint text-pine">
            <PinIcon />
          </span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${alertCount > 0 ? 'bg-danger' : 'bg-pine'}`}
          />
        </div>
        <div className="mt-2.5 text-body font-bold text-content">{c.liveMap}</div>
        <div className="text-meta text-muted">
          {interpolate(c.liveMapMeta, { onsite: summary.onSite, alerts: alertCount })}
        </div>
      </button>

      <button
        type="button"
        onClick={onLeaderboard}
        className="flex-1 rounded-input border border-line bg-surface p-3.5 text-left transition active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-8 w-8 items-center justify-center rounded-input bg-amber-tint text-heading">
            🏆
          </span>
        </div>
        <div className="mt-2.5 text-body font-bold text-content">{c.leaderboard}</div>
        <div className="truncate text-meta text-muted">
          {leaderName ? interpolate(c.leaderboardMeta, { group: leaderName }) : '—'}
        </div>
      </button>
    </div>
  )
}

function PinIcon() {
  return (
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
      <path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.3" />
    </svg>
  )
}
