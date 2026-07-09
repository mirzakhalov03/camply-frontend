import { Skeleton } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import {
  useLeaderboard,
  useAdjustGroupPoints,
  deriveLeaderboard,
} from '../../../../lib/leaderboard'
import { OrgLeaderboardRow } from './OrgLeaderboardRow'

/*
  Leaderboard tab — the organizer awards / adjusts group points. Reads the SAME
  leaderboard the participant Ranks screen shows (deriveLeaderboard) and writes back
  to the same cache, so ranks + trends recompute live as points change.
*/
export function LeaderboardTab() {
  const { t } = useTranslation()
  const d = t.org.detail
  const { data, isPending, isError } = useLeaderboard()
  const adjust = useAdjustGroupPoints()

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 pt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28" tone="surface" />
        ))}
      </div>
    )
  }
  if (isError) return <p className="py-8 text-center text-body text-muted">{d.loadError}</p>

  const view = deriveLeaderboard(data)

  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex items-center gap-3 rounded-card bg-pine p-4">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-input bg-white/15 text-heading">
          🏆
        </span>
        <div className="flex-1 text-white">
          <div className="text-title font-bold">{d.lbTitle}</div>
          <div className="text-caption text-white/80">{d.lbSubtitle}</div>
        </div>
        <span className="text-meta font-semibold text-white/80">{data.periodLabel}</span>
      </div>

      {view.rows.map((group) => (
        <OrgLeaderboardRow
          key={group.id}
          group={group}
          onAdd={() => adjust.mutate({ groupId: group.id, delta: 25 })}
          onSubtract={() => adjust.mutate({ groupId: group.id, delta: -25 })}
        />
      ))}
    </div>
  )
}
