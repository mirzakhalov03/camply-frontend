import { Avatar, Badge } from '../../ui'
import type { RankedGroup } from '../../../lib/leaderboard'

type Props = {
  group: RankedGroup
  /** Translated 'YOU' badge label. */
  youLabel: string
}

// Trend arrow color. Explicit hex (not tokens) so the up/down semantics stay
// fixed on both light and dark tinted rows; 'same' rides the muted token.
const TREND_COLOR = { up: '#12A06A', down: '#E0733F', same: 'var(--color-muted)' } as const
const TREND_GLYPH = { up: '▲', down: '▼', same: '—' } as const

/*
  One ranked group. The camper's own group gets a pine-tinted highlight so it's
  instantly findable in the list. The bar is decorative — the score is also shown
  as text — so it needs no ARIA. Group color is runtime data → inline style.
  Renders a plain <div>; the screen wraps it in the <li> so the animation and
  list semantics stay valid.
*/
export function LeaderboardRow({ group, youLabel }: Props) {
  const { direction, delta } = group.trend

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-[0_3px_10px_rgba(20,40,30,0.04)] ${
        group.isYou ? 'border-pine bg-green-tint' : 'border-line bg-surface'
      }`}
    >
      <span className="w-5 flex-none text-center text-title font-extrabold text-muted">
        {group.rank}
      </span>

      <Avatar
        name={group.name}
        initials={group.initials}
        photo={group.photo}
        color={group.color}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-title font-bold text-content">{group.name}</span>
          {group.isYou && (
            <Badge tone="pine" solid className="flex-none px-1.5 py-0.5 text-[9px]">
              {youLabel}
            </Badge>
          )}
        </div>
        <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full"
            style={{ width: `${group.barPct}%`, backgroundColor: group.color }}
          />
        </div>
      </div>

      <div className="flex-none text-right">
        <div className="text-title font-extrabold text-content">{group.score}</div>
        <div className="text-meta font-bold" style={{ color: TREND_COLOR[direction] }}>
          {TREND_GLYPH[direction]}
          {direction !== 'same' ? ` ${delta}` : ''}
        </div>
      </div>
    </div>
  )
}
