import { useTranslation } from '../../../i18n/useTranslation'
import type { OrganizerSummary } from '../../../api/services/camps.service'

/*
  The three headline totals across every camp. The first tile is filled pine (the
  primary metric — total participants); the other two are plain surface tiles.
*/
export function StatStrip({ summary }: { summary: OrganizerSummary }) {
  const { t } = useTranslation()
  const c = t.org.camps
  return (
    <div className="flex gap-2.5">
      <Tile primary value={summary.totalParticipants} label={c.statParticipants} />
      <Tile value={summary.activeCamps} label={c.statActiveCamps} />
      <Tile value={summary.totalGroups} label={c.statGroups} accent />
    </div>
  )
}

function Tile({
  value,
  label,
  primary = false,
  accent = false,
}: {
  value: number
  label: string
  primary?: boolean
  accent?: boolean
}) {
  const valueColor = primary ? 'text-white' : accent ? 'text-amber' : 'text-content'
  const labelColor = primary ? 'text-white/80' : 'text-muted'
  return (
    <div
      className={`flex-1 rounded-card p-3.5 ${
        primary ? 'bg-pine' : 'border border-line bg-surface'
      }`}
    >
      <div className={`text-display font-bold ${valueColor}`}>{value}</div>
      <div className={`text-meta font-medium ${labelColor}`}>{label}</div>
    </div>
  )
}
