import { useCurrentWeather } from '@/api/queries/weather.queries'
import { CONDITION_GLYPH } from '@/api/services/weather.service'

/*
  Current-weather chip for the camp cover. Owns its own data (useCurrentWeather →
  device location + Open-Meteo) so CampCover stays purely presentational. Weather is
  external and may be slow, denied, or offline; the chip degrades to NOTHING — it
  renders only once data exists, never a skeleton or a "—°" dash (a dash reads as
  broken over a hero photo). Styled to match the cover's other floating glass controls.
*/
export function WeatherChip() {
  const { data } = useCurrentWeather()
  if (!data) return null

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-white shadow-md backdrop-blur-md">
      <span className="text-body font-bold leading-none">{Math.round(data.tempC)}°</span>
      <span className="text-body leading-none">{CONDITION_GLYPH[data.condition]}</span>
    </div>
  )
}
