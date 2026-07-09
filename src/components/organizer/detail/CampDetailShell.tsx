import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '../../ui'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { useOrganizerCamp } from '../../../api/queries/camps.queries'
import type { CampDetailContext } from './campDetailContext'
import { CampDetailTabs } from './CampDetailTabs'

/*
  Camp Detail layout — the header + tab bar shared by every tab, at
  `/org/camps/:campId`. Loads the camp meta once and passes it to the tabs via
  Outlet context; each tab owns its own camp-scoped data. The whole thing scrolls
  inside the org shell's <main>, so the org bottom nav / sidebar stays put.
*/
export function CampDetailShell() {
  const { campId = '' } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const d = t.org.detail
  const c = t.org.camps
  const campQuery = useOrganizerCamp(campId)

  if (campQuery.isPending) return <HeaderSkeleton />
  if (campQuery.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-card bg-danger-tint text-2xl">
          ⚠️
        </span>
        <p className="text-body text-muted">{d.loadError}</p>
        <button
          type="button"
          onClick={() => navigate('/org/camps')}
          className="rounded-full bg-pine px-5 py-2 text-caption font-bold text-white active:scale-95"
        >
          {d.back}
        </button>
      </div>
    )
  }

  const camp = campQuery.data
  const statusLabel = {
    active: c.statusActive,
    upcoming: c.statusUpcoming,
    draft: c.statusDraft,
    archived: c.statusArchived,
  }[camp.status]
  const ctx: CampDetailContext = { camp }

  return (
    <div className="pb-24 md:pb-8">
      {/* Header: cover band + overlapping meta card */}
      <div className="relative h-28 bg-gradient-to-br from-pine to-pine-light md:h-32">
        <button
          type="button"
          onClick={() => navigate('/org/camps')}
          aria-label={d.back}
          className="absolute left-5 top-4 flex h-9 w-9 items-center justify-center rounded-input bg-white/20 text-white backdrop-blur-sm active:scale-95 md:left-8"
        >
          <BackIcon />
        </button>
      </div>

      <div className="relative -mt-10 px-5 md:px-8">
        <div className="rounded-card border border-line bg-surface p-4 shadow-[0_6px_18px_rgba(20,40,30,0.08)]">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-meta font-bold ${
                camp.status === 'active' ? 'bg-green-tint text-pine' : 'bg-soft text-muted'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${camp.status === 'active' ? 'bg-pine' : 'bg-muted'}`}
              />
              {statusLabel}
            </span>
            {camp.dayTotal > 0 ? (
              <span className="text-caption text-muted">
                {interpolate(c.dayProgress, { current: camp.dayCurrent, total: camp.dayTotal })}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-subhead font-bold text-content">{camp.name}</h1>
          <p className="mt-0.5 text-caption text-muted">
            📍 {camp.location} · {camp.dateRange}
          </p>
          <div className="mt-3 flex gap-6">
            <Stat value={camp.participantCount} label={d.statParticipants} />
            <Stat value={camp.groupCount} label={d.statGroups} />
            <Stat value={`${camp.checkinPct}%`} label={d.statCheckedIn} accent />
          </div>
        </div>
      </div>

      <CampDetailTabs />

      <div className="px-5 pt-2 md:px-8">
        <Outlet context={ctx} />
      </div>
    </div>
  )
}

function Stat({
  value,
  label,
  accent = false,
}: {
  value: string | number
  label: string
  accent?: boolean
}) {
  return (
    <div>
      <div className={`text-subhead font-bold ${accent ? 'text-pine' : 'text-content'}`}>
        {value}
      </div>
      <div className="text-meta text-muted">{label}</div>
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div>
      <div className="h-28 bg-gradient-to-br from-pine to-pine-light md:h-32" />
      <div className="-mt-10 px-5 md:px-8">
        <Skeleton className="h-36" tone="surface" />
      </div>
      <div className="flex gap-2 px-5 pt-4 md:px-8">
        <Skeleton className="h-9 w-28" tone="surface" />
        <Skeleton className="h-9 w-20" tone="surface" />
        <Skeleton className="h-9 w-20" tone="surface" />
      </div>
    </div>
  )
}

function BackIcon() {
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
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
