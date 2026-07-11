# Organizer stat strip — weather tile

**Date:** 2026-07-12
**Surface:** Organizer dashboard (`/org/camps`), the `StatStrip` under the header.

## Goal

Replace the third headline stat with the **current temperature at the user's device
location**. New tile order: **Participants** (pine) → **Groups** (plain) →
**Weather** (amber). The **On-site** tile is removed from this strip.

## Approach — pure frontend, no backend, no API key

The temperature is fetched entirely in the browser via two keyless, CORS-friendly
steps:

1. `navigator.geolocation` → the device's lat/lon (with the user's permission).
2. **Open-Meteo** (open-meteo.com) → current temperature + a WMO weather code,
   mapped onto a coarse `condition` enum.

Because both are keyless, there is no secret to leak — the "must go through a
backend" rule only applies to *keyed* providers. Weather is **device-scoped**, not
camp-scoped: it reflects wherever the organizer physically is, the same across all
their camps.

## Data contract

```ts
export type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'storm' | 'fog'
export type CurrentWeather = {
  tempC: number               // current temperature, Celsius (Uzbekistan standard)
  condition: WeatherCondition // drives a small glyph (☀️/☁️/🌧️…)
  fetchedAt: string           // ISO timestamp — when the reading was taken
}
```

## Principles

1. **Provider isolated in one file.** The whole provider (geolocation + Open-Meteo
   + code mapping) lives in `weather.service.ts`. Moving it behind Camply's own
   backend later (central caching, or a keyed provider) is a one-file change; the
   UI, hook, and states never move. This service uses `fetch`, not `axiosInstance`
   — axiosInstance is the boundary to *our* backend (attaches our auth token / base
   URL), which would be wrong for a third-party host.

2. **Weather must never break the dashboard.** It depends on a location permission
   and a third-party API, so it may be slow, denied, or offline. It gets its **own**
   query, kept OUT of the dashboard's error/loading gate (which only covers `camps`
   + `summary`). On failure the tile shows a quiet `—°` dash; the rest of the
   dashboard is unaffected. An optional ornament must never blank a critical screen.

## Files

1. `api/queryKeys.ts` — `weatherKeys.current` (root-level; device-scoped, not under
   a campId).
2. `lib/geolocation.ts` — `getCurrentPosition()`: a Promise wrapper over
   `navigator.geolocation` (`timeout: 10s`, `maximumAge: 3h`).
3. `api/services/weather.service.ts` — `weatherService.getCurrent()`: geolocation →
   Open-Meteo `fetch` → `toCondition(weather_code)` → `CurrentWeather`.
4. `api/queries/weather.queries.ts` — `useCurrentWeather()`: `staleTime: 3h` (serve
   cached, re-fetch + re-read GPS only when older than 3h), `retry: 1` (fail fast to
   the dash).
5. `components/organizer/camps/WeatherTile.tsx` — owns the loading / error /
   fallback rendering so `StatStrip` stays simple. Shows `{tempC}°` in amber with a
   small condition glyph; skeleton while loading; `—°` on error or denied location.
6. `components/organizer/camps/StatStrip.tsx` — reorder to
   Participants → Groups → `<WeatherTile />`.
7. `i18n/translations.ts` — add `org.camps.statWeather`
   (**Harorat / Погода / Weather**). `statOnSite` key kept (now unused here;
   reserved for On-site's future home on the detail screen).

## Out of scope (explicitly)

- A backend weather proxy (deferred; the seam makes it a one-file swap later).
- Camp-location weather / geocoding the camp's city (device location chosen instead).
- Finding On-site a new home (noted for the camp detail screen, not built here).
- Temperature unit toggle (Celsius only).
