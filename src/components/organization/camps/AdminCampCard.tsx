import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Badge } from '../../ui'
import type { AdminCamp, AdminCampStatus } from '../../../api/services/adminCamps.service'

/*
  One camp as the organization admin sees it — READ-ONLY (the org rarely creates or
  manages camps; that's the organizer's job). Name, organizer attribution, location,
  dates, a status Badge, and the participant count.
*/

const STATUS_TONE: Record<AdminCampStatus, 'pine' | 'amber' | 'muted'> = {
  active: 'pine',
  upcoming: 'amber',
  draft: 'muted',
  archived: 'muted',
}

export function AdminCampCard({ camp }: { camp: AdminCamp }) {
  const { t } = useTranslation()

  const statusLabel = {
    active: t.admin.camps.statusActive,
    upcoming: t.admin.camps.statusUpcoming,
    draft: t.admin.camps.statusDraft,
    archived: t.admin.camps.statusArchived,
  }[camp.status]

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-title font-bold text-content">{camp.name}</div>
          <div className="mt-0.5 text-caption text-muted">
            {interpolate(t.admin.camps.by, { name: camp.organizerName })}
          </div>
        </div>
        <Badge tone={STATUS_TONE[camp.status]}>{statusLabel}</Badge>
      </div>

      <div className="mt-3 flex items-center gap-3 text-caption text-muted">
        <span>{camp.location}</span>
        <span aria-hidden>·</span>
        <span className="font-mono">{camp.dateRange}</span>
        <span aria-hidden>·</span>
        <span>{interpolate(t.admin.camps.participants, { count: camp.participantCount })}</span>
      </div>
    </div>
  )
}
