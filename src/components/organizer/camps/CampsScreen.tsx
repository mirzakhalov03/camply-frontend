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
  const { openCamp, openCampMap, openChat } = useOrg()

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
    <div className="flex flex-col gap-3.5 px-5 pb-6 pt-4 md:px-8 md:pb-8">
      {/* Header */}
      <header>
        <p className="text-caption font-medium text-muted">
          {interpolate(c.welcome, { name: summary.organizerName })}
        </p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-display font-bold text-content">{primary?.name ?? c.yourCamps}</h1>
          <button
            type="button"
            onClick={openChat}
            aria-label={c.openChatAria}
            className="relative flex h-[42px] w-[42px] flex-none items-center justify-center rounded-input border border-line bg-surface text-pine shadow-[0_3px_12px_rgba(20,40,30,0.05)] active:scale-95"
          >
            <ChatIcon />
            {summary.unreadChat > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-canvas bg-amber px-1 text-[9px] font-extrabold text-amber-ink">
                {summary.unreadChat}
              </span>
            ) : null}
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

      {/* The organizer's current camp */}
      {primary ? <CampCard camp={primary} onOpen={() => openCamp(primary.id)} /> : null}
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

function ChatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  )
}
