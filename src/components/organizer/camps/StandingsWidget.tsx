import { Avatar } from '../../ui'
import { useTranslation } from '../../../i18n/useTranslation'
import type { RankedGroup } from '../../../lib/leaderboard'

/*
  Compact top-3 standings on the dashboard. It renders the SAME derived leaderboard
  the participant Ranks screen and the organizer Leaderboard tab use — reads flow
  through one shared domain module (lib/leaderboard.ts), the organizer just adds the
  write side later. "View all" opens the camp's full leaderboard.
*/
export function StandingsWidget({
  rows,
  onViewAll,
}: {
  rows: RankedGroup[]
  onViewAll: () => void
}) {
  const { t } = useTranslation()
  const c = t.org.camps
  const top3 = rows.slice(0, 3)

  return (
    <button
      type="button"
      onClick={onViewAll}
      className="w-full rounded-card border border-line bg-surface p-4 text-left shadow-[0_4px_14px_rgba(20,40,30,0.05)] transition active:scale-[0.99]"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-body font-bold text-content">{c.topGroups}</span>
        <span className="text-caption font-semibold text-pine">{c.viewAll}</span>
      </div>
      <div className="flex flex-col gap-1">
        {top3.map((g) => (
          <div key={g.id} className="flex items-center gap-2.5 py-1">
            <span className="w-3.5 flex-none text-center text-caption font-extrabold text-muted">
              {g.rank}
            </span>
            <Avatar name={g.name} initials={g.initials} color={g.color} photo={g.photo} size="xs" />
            <span className="flex-1 truncate text-body font-semibold text-content">{g.name}</span>
            <span className="flex-none text-title font-extrabold text-content">{g.score}</span>
          </div>
        ))}
      </div>
    </button>
  )
}
