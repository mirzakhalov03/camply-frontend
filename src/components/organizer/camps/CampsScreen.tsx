import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { useOrganizerCamps, useOrganizerSummary } from '../../../api/queries/camps.queries'
import { useActiveHelpRequests } from '../../../api/queries/helpRequests.queries'
import { useLeaderboard, deriveLeaderboard } from '../../../lib/leaderboard'
import { useOrg } from '../orgContext'
import { StatStrip } from './StatStrip'
import { HelpBanner } from './HelpBanner'
import { QuickLinks } from './QuickLinks'
import { StandingsWidget } from './StandingsWidget'
import { CampCard } from './CampCard'
import { CampsSkeleton } from './CampsSkeleton'
import type { OrganizerCamp } from '../../../api/services/camps.service'

/*
  The organizer dashboard — the `/org/camps` home. Composes the small widgets and
  owns the data fetching + loading/empty/error states (ReadyProduct §9). Every
  string is trilingual; every color is a token. Layout is mobile-first (single
  column) and opens up to two columns from md — organizers live on their phone but
  also run ops from a laptop.

  The "primary camp" (first active, else first) is where the cross-camp shortcuts —
  Live map, Leaderboard, and locating an SOS — point, since those are per-camp
  surfaces.
*/
export function CampsScreen() {
  const { t } = useTranslation()
  const c = t.org.camps
  const { openCamp, openCampMap, openCreate } = useOrg()

  const campsQuery = useOrganizerCamps()
  const summaryQuery = useOrganizerSummary()
  const { data: help } = useActiveHelpRequests()
  const { data: leaderboard } = useLeaderboard()

  if (campsQuery.isPending || summaryQuery.isPending) return <CampsSkeleton />

  if (campsQuery.isError || summaryQuery.isError) {
    return (
      <ErrorState
        message={c.error}
        retry={c.retry}
        onRetry={() => {
          campsQuery.refetch()
          summaryQuery.refetch()
        }}
      />
    )
  }

  const camps = campsQuery.data
  const summary = summaryQuery.data
  const primary: OrganizerCamp | undefined = camps.find((x) => x.status === 'active') ?? camps[0]
  const standings = leaderboard ? deriveLeaderboard(leaderboard) : null
  const activeHelp = help?.[0] ?? null

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-24 pt-4 md:px-8 md:pb-8">
      {/* Header */}
      <header>
        <p className="text-caption font-medium text-muted">
          {interpolate(c.welcome, { name: summary.organizerName })}
        </p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-display font-bold text-content">{c.yourCamps}</h1>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-full bg-pine px-3.5 py-2 text-caption font-bold text-white shadow-[0_4px_12px_rgba(15,107,79,0.28)] active:scale-95"
          >
            <PlusIcon />
            {c.newCamp}
          </button>
        </div>
      </header>

      <StatStrip summary={summary} />

      {activeHelp ? (
        <HelpBanner help={activeHelp} onView={() => openCampMap(activeHelp.campId)} />
      ) : null}

      {/* Live-ops shortcuts + standings — two columns from md. */}
      <div className="grid gap-3.5 md:grid-cols-2">
        <QuickLinks
          summary={summary}
          alertCount={help?.length ?? 0}
          leaderName={standings?.rows[0]?.name ?? null}
          onMap={() => primary && openCampMap(primary.id)}
          onLeaderboard={() => primary && openCamp(primary.id)}
        />
        {standings ? (
          <StandingsWidget
            rows={standings.rows}
            onViewAll={() => primary && openCamp(primary.id)}
          />
        ) : null}
      </div>

      {/* Camps list */}
      <h2 className="mt-1 text-meta font-bold uppercase tracking-wider text-muted">
        {c.campsLabel}
      </h2>
      {camps.length === 0 ? (
        <EmptyState title={c.empty} body={c.emptyBody} />
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2">
          {camps.map((camp) => (
            <CampCard key={camp.id} camp={camp} onOpen={() => openCamp(camp.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ErrorState({
  message,
  retry,
  onRetry,
}: {
  message: string
  retry: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-card bg-danger-tint text-2xl">
        ⚠️
      </span>
      <p className="text-body text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-pine px-5 py-2 text-caption font-bold text-white active:scale-95"
      >
        {retry}
      </button>
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-card border border-dashed border-line bg-surface px-8 py-10 text-center">
      <span className="text-3xl">🏕</span>
      <p className="text-title font-bold text-content">{title}</p>
      <p className="text-caption text-muted">{body}</p>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
