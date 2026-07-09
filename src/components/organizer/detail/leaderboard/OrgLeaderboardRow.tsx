import { Avatar } from '../../../ui'
import type { RankedGroup } from '../../../../lib/leaderboard'

/*
  One group on the organizer's Leaderboard tab: the ranked row plus ±25 controls to
  award / deduct points. Adjusting fires an optimistic cache write (useAdjustGroupPoints)
  so the whole board re-ranks instantly. Trend colors are fixed hex (semantics that
  must not flip in dark mode); group color is runtime data.
*/
const TREND_COLOR = { up: '#12A06A', down: '#E0733F', same: 'var(--color-muted)' } as const
const TREND_GLYPH = { up: '▲', down: '▼', same: '—' } as const

export function OrgLeaderboardRow({
  group,
  onAdd,
  onSubtract,
}: {
  group: RankedGroup
  onAdd: () => void
  onSubtract: () => void
}) {
  const { direction, delta } = group.trend
  const b = group.breakdown

  return (
    <div className="rounded-card border border-line bg-surface p-3.5 shadow-[0_3px_10px_rgba(20,40,30,0.04)]">
      <div className="flex items-center gap-3">
        <span className="w-4 flex-none text-center text-title font-extrabold text-muted">
          {group.rank}
        </span>
        <Avatar
          name={group.name}
          initials={group.initials}
          color={group.color}
          photo={group.photo}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-title font-bold text-content">{group.name}</span>
            <span
              className="flex-none text-meta font-bold"
              style={{ color: TREND_COLOR[direction] }}
            >
              {TREND_GLYPH[direction]}
              {direction !== 'same' ? ` ${delta}` : ''}
            </span>
          </div>
          <div className="truncate text-caption text-muted">
            ⚽ {b.activities} · ✓ {b.attendance} · 🎯 {b.challenges}
          </div>
        </div>
        <span className="flex-none text-heading font-extrabold text-content">{group.score}</span>
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onSubtract}
          className="h-9 flex-1 rounded-input border border-line bg-soft text-body font-bold text-muted active:scale-95"
        >
          − 25
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="h-9 flex-1 rounded-input border border-pine/20 bg-green-tint text-body font-bold text-pine active:scale-95"
        >
          + 25
        </button>
      </div>
    </div>
  )
}
