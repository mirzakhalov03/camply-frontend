import { useQuery } from '@tanstack/react-query'
import { weatherService } from '../services/weather.service'
import { weatherKeys } from '../queryKeys'

/*
  The weather QUERY — the React layer over weatherService. Components call this hook
  only; never the service, fetch, or geolocation directly.

  Two settings make it robust and cheap against an external source + a permission
  prompt:
  - staleTime 3h: weather barely moves; serve the cached reading on every visit and
    only re-fetch (and re-read GPS) once it's older than 3 hours.
  - retry 1: if location is denied or the provider is down, fail fast so the tile
    falls back to a dash instead of spinning. Weather is non-critical.
*/
const THREE_HOURS = 3 * 60 * 60 * 1000

export function useCurrentWeather() {
  return useQuery({
    queryKey: weatherKeys.current,
    queryFn: () => weatherService.getCurrent(),
    staleTime: THREE_HOURS,
    retry: 1,
  })
}
