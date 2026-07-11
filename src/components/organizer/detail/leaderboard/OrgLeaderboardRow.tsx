import { Avatar } from '../../../ui'
import type { RankedGroup } from '../../../../lib/leaderboard'

/*
  One group on the organizer's Leaderboard tab. The whole row is the tap target →
  opens the points wheel sheet (PointsWheelSheet) to award / adjust points; applying
  fires an optimistic cache write so the whole board re-ranks instantly. Trend colors
  are fixed hex (semantics that must not flip in dark mode); group color is runtime data.
*/
const TREND_COLOR = { up: '#12A06A', down: '#E0733F', same: 'var(--color-muted)' } as const
const TREND_GLYPH = { up: '▲', down: '▼', same: '—' } as const

export function OrgLeaderboardRow({ group, onOpen }: { group: RankedGroup; onOpen: () => void }) {
  const { direction, delta } = group.trend
  const b = group.breakdown

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-card border border-line bg-surface p-3.5 text-left shadow-[0_3px_10px_rgba(20,40,30,0.04)] transition active:scale-[0.99]"
    >
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
        <ChevronIcon />
      </div>
    </button>
  )
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-none text-muted"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
