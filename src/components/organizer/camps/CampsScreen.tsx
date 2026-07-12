import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { useOrganizerCamps, useOrganizerSummary } from '../../../api/queries/camps.queries'
import { NewCampSheet } from './NewCampSheet'
import { useActiveHelpRequests } from '../../../api/queries/helpRequests.queries'
import { deriveLeaderboard } from '../../../lib/leaderboard'
import { useLeaderboard } from '../../../api/queries/leaderboard.queries'
import { useOrg } from '../orgContext'
import { StatStrip } from './StatStrip'
import { HelpBanner } from './HelpBanner'
import { StandingsWidget } from './StandingsWidget'
import { CampsSkeleton } from './CampsSkeleton'
import { CAMP_FEATURES, type CampFeature } from '../detail/campFeatures'
import { FeatureCard } from '../detail/FeatureCard'
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
  const navigate = useNavigate()
  const { openCampMap, openNotifications } = useOrg()
  const [newCampOpen, setNewCampOpen] = useState(false)

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
  const alertCount = help?.length ?? 0
  const leaderName = standings?.rows[0]?.name ?? null

  // One card renderer for every feature — the home is the single launcher. Each card
  // links straight to the feature full-screen for the primary camp (no in-between hub).
  const renderFeature = (f: CampFeature, camp: OrganizerCamp) => (
    <FeatureCard
      key={f.key}
      to={`/org/camps/${camp.id}/${f.to}`}
      icon={f.icon}
      tint={f.tint}
      label={f.label(t)}
      stat={f.stat({ t, camp, summary, alertCount, leaderName })}
    />
  )
  const liveOps = CAMP_FEATURES.filter((f) => f.key === 'map' || f.key === 'leaderboard')
  const otherFeatures = CAMP_FEATURES.filter((f) => f.key !== 'map' && f.key !== 'leaderboard')

  return (
    <div className="flex flex-col gap-3.5 px-5 pb-6 pt-4 md:px-8 md:pb-8">
      {/* Header */}
      <header>
        <p className="text-caption font-medium text-muted">
          {interpolate(c.welcome, { name: summary.organizerName })}
        </p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-display font-bold text-content">{primary?.name ?? c.yourCamps}</h1>
          {/* Actions — the create-camp entry sits beside notifications, both nudged
              up (-translate-y-2.5) so they sit a touch above the heading baseline. */}
          <div className="flex flex-none -translate-y-2.5 items-center gap-2">
            <button
              type="button"
              onClick={() => setNewCampOpen(true)}
              className="flex h-[42px] items-center gap-1.5 rounded-input bg-pine px-3.5 text-caption font-bold text-white shadow-[0_3px_12px_rgba(20,40,30,0.05)] active:scale-95"
            >
              <span aria-hidden className="text-body leading-none">
                +
              </span>
              {t.createCamp.title}
            </button>
            <button
              type="button"
              onClick={openNotifications}
              aria-label={c.notifications}
              className="relative flex h-[42px] w-[42px] items-center justify-center rounded-input border border-line bg-surface text-pine shadow-[0_3px_12px_rgba(20,40,30,0.05)] active:scale-95"
            >
              <BellIcon />
            </button>
          </div>
        </div>
      </header>

      <StatStrip summary={summary} />

      {activeHelp ? (
        <HelpBanner help={activeHelp} onView={() => openCampMap(activeHelp.campId)} />
      ) : null}

      {/* Live-ops: Live map + Leaderboard, the priority surfaces, as big cards. */}
      {primary ? (
        <div className="grid grid-cols-2 gap-2.5 md:gap-3.5">
          {liveOps.map((f) => renderFeature(f, primary))}
        </div>
      ) : null}

      {/* Top groups standings — "View all" opens the leaderboard feature directly. */}
      {standings ? (
        <StandingsWidget
          rows={standings.rows}
          onViewAll={() => primary && navigate(`/org/camps/${primary.id}/leaderboard`)}
        />
      ) : null}

      {/* The rest of the features, each opening full-screen for the primary camp. */}
      {primary ? (
        <div className="grid grid-cols-2 gap-2.5 md:gap-3.5 lg:grid-cols-4">
          {otherFeatures.map((f) => renderFeature(f, primary))}
        </div>
      ) : null}

      <NewCampSheet open={newCampOpen} onClose={() => setNewCampOpen(false)} />
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

function BellIcon() {
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}
