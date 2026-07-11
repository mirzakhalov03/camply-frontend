import { useTranslation } from '../../../i18n/useTranslation'
import type { OrganizerSummary } from '../../../api/services/camps.service'
import { WeatherTile } from './WeatherTile'

/*
  The three headline tiles. The first is filled pine (the primary metric — total
  participants); the second is a plain surface tile (groups); the third is the
  current weather at the user's location (amber accent), owned by WeatherTile since
  it fetches external data and must degrade on its own.
*/
export function StatStrip({ summary }: { summary: OrganizerSummary }) {
  const { t } = useTranslation()
  const c = t.org.camps
  return (
    <div className="flex gap-2.5">
      <Tile primary value={summary.totalParticipants} label={c.statParticipants} />
      <Tile value={summary.totalGroups} label={c.statGroups} />
      <WeatherTile label={c.statWeather} />
    </div>
  )
}

function Tile({
  value,
  label,
  primary = false,
}: {
  value: number
  label: string
  primary?: boolean
}) {
  const valueColor = primary ? 'text-white' : 'text-content'
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
