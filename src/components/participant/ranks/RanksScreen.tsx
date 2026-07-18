import { useTranslation } from '../../../i18n/useTranslation'
import { useCamp } from '../campContext'
import { deriveLeaderboard } from '../../../lib/leaderboard'
import { useLeaderboard } from '../../../api/queries/leaderboard.queries'
import { useGroupStore } from '../../../store/useGroupStore'
import { PodiumHeader } from './PodiumHeader'
import { YourStandingCard, type Comparison } from './YourStandingCard'
import { LeaderboardRow } from './LeaderboardRow'
import { PointsLegend } from './PointsLegend'
import { RanksSkeleton } from './RanksSkeleton'

/*
  Participant Ranks. OWNS the data (useLeaderboard) and turns it into the view
  model (deriveLeaderboard) — the child components are presentational and never
  see raw data or know it's mock. When the backend lands, only fetchLeaderboard()
  changes; this file and the components stay exactly as they are.
*/
export function RanksScreen() {
  const { t } = useTranslation()
  const { campId } = useCamp()
  const { data, isPending, isError } = useLeaderboard(campId)
  // My group's locally uploaded photo — the SAME photo shown in the chat header.
  // Shared via useGroupStore so Ranks doesn't reach into the chat feature.
  const myGroupPhoto = useGroupStore((s) => s.photo)

  if (isPending) return <RanksSkeleton />

  if (isError || !data) {
    return <CenteredNote text={t.ranks.loadError} />
  }

  const view = deriveLeaderboard(data)

  if (view.rows.length === 0) {
    return <CenteredNote title={t.ranks.empty} text={t.ranks.emptyBody} />
  }

  // Merge model (same idea as ChatScreen mixing server history + local sends):
  // the derived rows carry each group's server photo; here we overlay my group's
  // locally uploaded photo on top of its avatar. Backend swap drops this line —
  // the photo would already arrive on `data`.
  const rows = myGroupPhoto
    ? view.rows.map((r) => (r.isYou ? { ...r, photo: myGroupPhoto } : r))
    : view.rows

  // Who "you" is measured against: the group one place ahead, or — if you're
  // already 1st — the runner-up you're leading. Computed here because the screen
  // holds the full list; the card just renders the verdict.
  const comparison: Comparison | null = view.you
    ? view.nextAhead
      ? { mode: 'behind', group: view.nextAhead }
      : view.you.rank === 1 && view.rows[1]
        ? { mode: 'leading', group: view.rows[1] }
        : null
    : null

  return (
    <div className="flex h-full flex-col bg-canvas">
      <PodiumHeader title={t.ranks.title} rows={rows} />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2.5 px-[18px] pb-5 pt-4">
          {view.you && (
            <div className="animate-rise-in" style={{ animationDelay: '40ms' }}>
              <YourStandingCard you={view.you} comparison={comparison} />
            </div>
          )}

          <ol className="flex flex-col gap-2.5">
            {rows.map((g, i) => (
              <li
                key={g.id}
                className="animate-rise-in"
                style={{ animationDelay: `${90 + i * 45}ms` }}
              >
                <LeaderboardRow group={g} youLabel={t.ranks.you} />
              </li>
            ))}
          </ol>

          <div className="animate-rise-in pt-1" style={{ animationDelay: '380ms' }}>
            <PointsLegend />
          </div>
        </div>
      </div>
    </div>
  )
}

// Small shared empty/error panel — keeps the screen from crashing on no data.
function CenteredNote({ title, text }: { title?: string; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-canvas px-10 text-center">
      {title && <div className="text-base font-bold text-content">{title}</div>}
      <p className="text-sm text-muted">{text}</p>
    </div>
  )
}
