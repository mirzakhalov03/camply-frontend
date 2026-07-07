import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { RankedGroup } from '../../../lib/leaderboard'

// Who to compare "you" against, and which way to phrase it. Computed by the
// screen (it has the full list); the card just renders the result.
export type Comparison = { mode: 'behind' | 'leading'; group: RankedGroup }

type Props = {
  you: RankedGroup
  comparison: Comparison | null
}

/*
  The camper's personal spotlight — their group's rank, points, and the one line
  that makes the leaderboard feel personal: how far ahead/behind they are. Pine-
  tinted so it reads as "mine". Only rendered when the participant is on the board.
*/
export function YourStandingCard({ you, comparison }: Props) {
  const { t } = useTranslation()

  const gapLine = comparison
    ? comparison.mode === 'behind'
      ? interpolate(t.ranks.behindLeader, {
          delta: comparison.group.score - you.score,
          name: comparison.group.name,
        })
      : interpolate(t.ranks.leadingBy, { delta: you.score - comparison.group.score })
    : null

  return (
    <section className="rounded-[20px] border border-pine/40 bg-green-tint p-4">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-pine text-lg font-extrabold text-white">
          {you.rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-pine">
            {t.ranks.yourStanding}
          </div>
          <div className="truncate text-base font-bold text-content">{you.name}</div>
        </div>
        <div className="flex-none text-right">
          <div className="text-2xl font-extrabold leading-none text-content">{you.score}</div>
          <div className="mt-0.5 text-[11px] text-muted">{t.ranks.points}</div>
        </div>
      </div>

      {gapLine && (
        <div className="mt-3 rounded-xl bg-surface/70 px-3 py-2 text-[13px] font-semibold text-content">
          {gapLine}
        </div>
      )}
    </section>
  )
}
