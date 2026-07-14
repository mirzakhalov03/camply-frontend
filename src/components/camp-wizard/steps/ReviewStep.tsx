import { useTranslation } from '../../../i18n/useTranslation'
import { Skeleton } from '../../ui'
import { useOrganizerCamp } from '../../../api/queries/camps.queries'
import { useCampGroups } from '../../../api/queries/campGroups.queries'

export function ReviewStep({ campId }: { campId: string }) {
  const { t } = useTranslation()
  const w = t.campWizard
  const camp = useOrganizerCamp(campId)
  const groups = useCampGroups(campId)

  if (camp.isPending) return <Skeleton className="h-40" tone="surface" />
  if (!camp.data) return <p className="text-body text-muted">{t.org.camps.error}</p>

  const c = camp.data
  const stats = [
    { label: w.statGroups, value: c.groupCount },
    { label: w.statOrganizers, value: c.organizerCount },
    { label: w.statParticipants, value: c.participantCount },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-title font-bold text-content">{w.reviewTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.reviewHint}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        <div className="text-heading font-bold text-content">{c.name}</div>
        <div className="flex flex-col gap-1.5 text-caption text-content">
          <div>📅 {c.dateRange}</div>
          <div>📍 {c.location}</div>
        </div>
        <div className="flex gap-2 border-t border-line pt-3">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 text-center">
              <div className="text-display font-extrabold text-pine">{s.value}</div>
              <div className="text-meta font-semibold text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {(groups.data ?? []).map((g) => (
          <div
            key={g.id}
            className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-3"
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-input bg-green-tint">
              🏕
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-body font-bold text-content">{g.name}</div>
              <div className="text-meta text-muted">{g.memberCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
