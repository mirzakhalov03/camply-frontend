import { useTranslation } from '../../../i18n/useTranslation'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

function formatRange(starts: string, ends: string): string {
  if (!starts || !ends) return ''
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(starts)} – ${fmt(ends)}`
}

export function ReviewStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const info = useCampDraftStore((s) => s.info)
  const groups = useCampDraftStore((s) => s.groups)
  const participants = useCampDraftStore((s) => s.participants)

  const stats = [
    { label: w.statGroups, value: groups.length },
    { label: w.statParticipants, value: participants.length },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-title font-bold text-content">{w.reviewTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.reviewHint}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        <div className="text-heading font-bold text-content">{info.name}</div>
        <div className="flex flex-col gap-1.5 text-caption text-content">
          <div>📅 {formatRange(info.starts, info.ends)}</div>
          <div>📍 {info.location}</div>
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
        {groups.map((g) => {
          const count = participants.filter((p) => p.groupTempId === g.tempId).length
          return (
            <div
              key={g.tempId}
              className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-3"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-input bg-green-tint">
                🏕
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-body font-bold text-content">{g.name}</div>
                <div className="text-meta text-muted">{count}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
