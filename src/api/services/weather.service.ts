import { getCurrentPosition } from '../../lib/geolocation'

/*
  The weather SERVICE — the boundary that turns "where is the user" into a current
  temperature. Two steps, both keyless and CORS-friendly, so this runs entirely in
  the browser with no backend and no secret to leak:

    1. navigator.geolocation → the device's lat/lon (with the user's permission).
    2. Open-Meteo (open-meteo.com) → current temperature + a WMO weather code.

  NOTE: this deliberately uses `fetch`, NOT our `axiosInstance`. axiosInstance is the
  boundary to *Camply's own* backend — it attaches our auth token and points at our
  API base URL, both of which would be wrong for a third-party host. Open-Meteo is
  external and unauthenticated, so a plain fetch is correct here.

  Because the whole provider lives in this one function, moving weather behind our
  own backend later (for central caching or a keyed provider) is a one-file change —
  nothing else in the app knows where the data comes from.
*/

/** Coarse sky state — drives the tile's glyph, not a forecast. */
export type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'fog'

/** Current weather at the user's location. */
export type CurrentWeather = {
  /** Current temperature in Celsius (Uzbekistan standard). */
  tempC: number
  condition: WeatherCondition
  /** ISO timestamp of when the reading was taken. */
  fetchedAt: string
}

/** Open-Meteo's `current` block, narrowed to the fields we request. */
type OpenMeteoResponse = {
  current: { temperature_2m: number; weather_code: number }
}

/*
  Map WMO weather codes (open-meteo.com/en/docs) onto our coarse condition enum.
  Groups of codes collapse to one glyph — we only need a sky hint, not a forecast.
*/
function toCondition(code: number): WeatherCondition {
  if (code <= 1) return 'clear' // 0 clear, 1 mainly clear
  if (code <= 3) return 'clouds' // 2 partly cloudy, 3 overcast
  if (code <= 48) return 'fog' // 45, 48 fog
  if (code <= 67) return 'rain' // 51–67 drizzle / rain
  if (code <= 77) return 'snow' // 71–77 snow
  if (code <= 82) return 'rain' // 80–82 rain showers
  if (code <= 86) return 'snow' // 85, 86 snow showers
  return 'storm' // 95–99 thunderstorm
}

/** Abort the request after this long so a hung connection fails to the dash, not forever. */
const FETCH_TIMEOUT = 8_000

export const weatherService = {
  /** Current weather at the device's location. Rejects if location or the API fails. */
  getCurrent: async (): Promise<CurrentWeather> => {
    const { lat, lon } = await getCurrentPosition()
    // Round to ~1km before sending to a third party — weather needs city precision,
    // not the organizer's exact GPS fix.
    const latitude = lat.toFixed(2)
    const longitude = lon.toFixed(2)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`Weather request failed: ${res.status}`)
      const { current } = (await res.json()) as OpenMeteoResponse

      return {
        tempC: current.temperature_2m,
        condition: toCondition(current.weather_code),
        fetchedAt: new Date().toISOString(),
      }
    } finally {
      clearTimeout(timeout)
    }
  },
}
