/*
  A promise wrapper around the browser's Geolocation API. `getCurrentPosition` is a
  callback-style API (success + error callbacks); wrapping it in a Promise lets our
  async data layer `await` it like any other fetch.

  Requires a secure context (HTTPS or localhost) and the user's permission — the
  browser shows an "Allow location?" prompt on first use. A rejection (denied,
  unsupported, or timeout) is expected and handled upstream by falling back to a
  neutral placeholder — never a crash.
*/

export type Coords = { lat: number; lon: number }

const THREE_HOURS = 3 * 60 * 60 * 1000

export function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      // Accept a cached fix up to 3h old (the org barely moves) to avoid spinning
      // the GPS on every read; give up after 10s so a bad signal fails to the dash.
      { timeout: 10_000, maximumAge: THREE_HOURS },
    )
  })
}
