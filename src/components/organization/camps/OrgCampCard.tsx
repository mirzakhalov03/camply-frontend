import { Link } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { Badge } from '../../ui'
import type { OrganizerCamp } from '../../../api/services/camps.service'

/*
  One camp card on the org "Camps history" screen (/admin/camps) — a gradient cover
  strip with a status badge, name, location + date range, and a 3-count row
  (participants / organizers / groups). Links to the camp detail (a later task).

  Status labels come from the existing FLAT `admin.camps.status*` keys (there is no
  `admin.camps.status` object) — same tone mapping as the org-wide read-only
  `AdminCampCard`.
*/
type Tone = 'pine' | 'amber' | 'muted'

const TONE: Record<OrganizerCamp['status'], Tone> = {
  active: 'pine',
  upcoming: 'amber',
  draft: 'muted',
  archived: 'muted',
}

export function OrgCampCard({ camp }: { camp: OrganizerCamp }) {
  const { t } = useTranslation()
  const c = t.admin.camps

  const statusLabel = {
    active: c.statusActive,
    upcoming: c.statusUpcoming,
    draft: c.statusDraft,
    archived: c.statusArchived,
  }[camp.status]

  return (
    <Link
      to={`/admin/camps/${camp.id}`}
      className="block overflow-hidden rounded-card border border-line bg-surface shadow-[0_5px_18px_rgba(20,40,30,0.06)] active:scale-[0.99]"
    >
      <div className="relative h-[70px] bg-gradient-to-br from-pine to-deep">
        <span className="absolute left-3.5 top-3">
          <Badge tone={TONE[camp.status]}>{statusLabel}</Badge>
        </span>
      </div>
      <div className="px-4 py-3.5">
        <div className="text-title font-bold text-content">{camp.name}</div>
        <div className="mt-0.5 text-caption text-muted">
          📍 {camp.location} · {camp.dateRange}
        </div>
        <div className="mt-3 flex gap-5">
          <Stat value={camp.participantCount} label={t.campWizard.statParticipants} />
          <Stat value={camp.organizerCount} label={t.campWizard.statOrganizers} />
          <Stat value={camp.groupCount} label={t.campWizard.statGroups} />
        </div>
      </div>
    </Link>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <span className="text-title font-bold text-content">{value}</span>
      <span className="text-caption text-muted"> {label.toLowerCase()}</span>
    </div>
  )
}
