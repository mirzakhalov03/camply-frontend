import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { Badge, Skeleton } from '../../ui'
import { useTranslation } from '../../../i18n/useTranslation'
import { useOrganizerCamp } from '../../../api/queries/camps.queries'
import { CAMP_FEATURES } from '../../organizer/detail/campFeatures'
import type { CampDetailContext } from '../../organizer/detail/campDetailContext'
import type { OrganizerCamp } from '../../../api/services/camps.service'

/*
  Camp Detail data boundary at `/admin/camps/:campId` — the ORGANIZATION's read-only
  window onto a camp. Loads the camp meta once (same `useOrganizerCamp` the organizer
  detail uses — org admins see the same live counts) and hands `camp` to the nested
  tab routes via Outlet context, exactly like `CampDetailShell` does for `/org/camps`.

  Reuses the organizer's existing tab screens (ParticipantsTab, GroupsTab, etc.)
  rather than duplicating a read-only version — they already read `useCampDetail()`
  from the shared `campDetailContext`, so this shell only needs to supply that
  context and its own chrome (header + tab strip). Deliberately does NOT reuse
  `FeatureShell`: that component hardcodes `navigate('/org/camps')` for its back
  arrow, which would bounce an org admin into the organizer surface.
*/

type Tone = 'pine' | 'amber' | 'muted'

const STATUS_TONE: Record<OrganizerCamp['status'], Tone> = {
  active: 'pine',
  upcoming: 'amber',
  draft: 'muted',
  archived: 'muted',
}

// Tab strip order (Participants → Groups → Leaderboard → Schedule → Announcements).
// `map` is organizer-only (live location), so it's excluded here.
const TAB_ORDER = ['participants', 'groups', 'leaderboard', 'schedule', 'announcements']

export function AdminCampDetailShell() {
  const { campId = '' } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const d = t.org.detail
  const c = t.admin.camps
  const campQuery = useOrganizerCamp(campId)

  if (campQuery.isPending) return <LoadingSkeleton />
  if (campQuery.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-card bg-danger-tint text-2xl">
          ⚠️
        </span>
        <p className="text-body text-muted">{d.loadError}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/camps')}
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

  const tabs = TAB_ORDER.map((key) => CAMP_FEATURES.find((f) => f.key === key)).filter(
    (feature): feature is (typeof CAMP_FEATURES)[number] => Boolean(feature),
  )

  const ctx: CampDetailContext = { camp }

  return (
    <div className="pb-8">
      <div className="relative h-28 bg-gradient-to-br from-pine to-deep px-5 pt-3.5 md:px-8">
        <button
          type="button"
          onClick={() => navigate('/admin/camps')}
          aria-label={d.back}
          className="flex h-9 w-9 items-center justify-center rounded-input bg-white/15 text-white active:scale-95"
        >
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
        </button>
      </div>

      <div className="-mt-10 px-5 md:px-8">
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[camp.status]}>{statusLabel}</Badge>
            <span className="text-caption text-muted">{camp.dateRange}</span>
          </div>
          <div className="mt-2 text-subhead font-bold text-content">{camp.name}</div>
          <div className="mt-0.5 text-caption text-muted">📍 {camp.location}</div>
          <div className="mt-3 flex gap-5">
            <Stat value={camp.participantCount} label={t.campWizard.statParticipants} />
            <Stat value={camp.organizerCount} label={t.campWizard.statOrganizers} />
            <Stat value={camp.groupCount} label={t.campWizard.statGroups} />
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex gap-2 overflow-x-auto px-5 md:px-8">
        {tabs.map((feature) => (
          <NavLink
            key={feature.key}
            to={feature.to}
            className={({ isActive }) =>
              `flex-none rounded-full px-4 py-2 text-caption font-bold ${
                isActive ? 'bg-green-tint text-pine' : 'text-muted'
              }`
            }
          >
            {feature.label(t)}
          </NavLink>
        ))}
      </div>

      <div className="px-5 pt-3.5 md:px-8">
        <Outlet context={ctx} />
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-heading font-bold text-content">{value}</div>
      <div className="text-caption text-muted">{label}</div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="pb-8">
      <div className="h-28 bg-gradient-to-br from-pine to-deep md:h-32" />
      <div className="-mt-10 px-5 md:px-8">
        <Skeleton className="h-36" tone="surface" />
      </div>
      <div className="mt-3.5 flex gap-2 px-5 md:px-8">
        <Skeleton className="h-9 w-24" tone="surface" />
        <Skeleton className="h-9 w-24" tone="surface" />
        <Skeleton className="h-9 w-24" tone="surface" />
      </div>
    </div>
  )
}
