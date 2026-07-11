import { useCurrentWeather } from '../../../api/queries/weather.queries'
import type { WeatherCondition } from '../../../api/services/weather.service'
import { Skeleton } from '../../ui'

/*
  The third stat tile — current temperature at the user's location. Unlike the
  Participants/Groups tiles (our own reliable data), weather is EXTERNAL and depends
  on a location permission + a third-party API, so it may be slow, denied, or
  offline. This tile owns its own states and degrades quietly: a skeleton while
  loading, a '—°' dash on error or if the user blocks location. It never surfaces an
  error — a weather hiccup must not disturb the dashboard.

  Styled to match StatStrip's surface tiles, with the temperature in amber.
*/

/** Coarse condition → glyph. Kept tiny on purpose; this is a status hint, not a forecast. */
const CONDITION_GLYPH: Record<WeatherCondition, string> = {
  clear: '☀️',
  clouds: '☁️',
  rain: '🌧️',
  snow: '❄️',
  storm: '⛈️',
  fog: '🌫️',
}

export function WeatherTile({ label }: { label: string }) {
  const { data, isPending } = useCurrentWeather()

  return (
    <div className="flex-1 rounded-card border border-line bg-surface p-3.5">
      <div className="flex items-baseline gap-1.5">
        {isPending ? (
          <Skeleton className="h-[26px] w-12" />
        ) : (
          <>
            <span className="text-display font-bold text-amber">
              {data ? `${Math.round(data.tempC)}°` : '—°'}
            </span>
            {data ? <span className="text-title">{CONDITION_GLYPH[data.condition]}</span> : null}
          </>
        )}
      </div>
      <div className="text-meta font-medium text-muted">{label}</div>
    </div>
  )
}
