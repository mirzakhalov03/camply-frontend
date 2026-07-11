import { queryClient } from '../../lib/queryClient'
import { campKeys } from '../queryKeys'

/*
  The realtime BRIDGE — the ONE place server-pushed updates enter the app. It
  holds a single WebSocket and routes incoming events into the SAME React Query
  cache the UI already reads. It deliberately owns NO copy of the data: a live
  update is just a setQueryData / invalidate on an existing key, so every hook
  subscribed to that key re-renders for free. This is why realtime needs no new
  store and no component changes — and why we don't reach for Redux/sockets-as-state.

  How to pick the cache write per event:
    • HIGH-FREQUENCY stream (map pins)  → setQueryData directly. Do NOT invalidate;
      that refetches and defeats the stream. Throttle bursts before writing.
    • LOW-FREQUENCY nudge (leaderboard) → invalidateQueries; let the server stay the
      source of truth for ordering/derivation.
    • APPEND (chat)                     → setQueryData, push onto the cached thread.

  STUB: the socket isn't opened anywhere yet (nothing calls connectRealtime). Wire
  it from a camp-scoped provider's useEffect — connect on enter, disconnect on
  leave. Event payload types are placeholders until the backend's event contract
  is real; a connection-status store (for a "reconnecting…" banner) is a later add.
*/

// ---- Event contract (placeholder shapes — match to the backend when real) ----
export type RealtimeEvent =
  | { type: 'map:pins'; campId: string; pins: unknown[] }
  | { type: 'leaderboard:update'; campId: string }
  | { type: 'chat:message'; campId: string; groupId: string; message: unknown }

// Default to the same origin (Vite can proxy `/ws` in dev); override in prod.
const WS_URL =
  import.meta.env.VITE_WS_URL ??
  `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`

let socket: WebSocket | null = null

/** Open the single socket for a camp. No-op if one is already open. */
export function connectRealtime(campId: string) {
  if (socket) return
  // The session cookie authenticates the WS handshake (same-origin); no token param.
  socket = new WebSocket(`${WS_URL}?campId=${campId}`)
  socket.onmessage = (e) => handleEvent(JSON.parse(e.data) as RealtimeEvent)
  // TODO (real impl): onclose → backoff-reconnect; onerror → log/monitor.
}

/** Close the socket (call on leaving the camp / logout). */
export function disconnectRealtime() {
  socket?.close()
  socket = null
}

function handleEvent(event: RealtimeEvent) {
  switch (event.type) {
    case 'map:pins':
      queryClient.setQueryData(campKeys.mapPins(event.campId), event.pins)
      break
    case 'leaderboard:update':
      queryClient.invalidateQueries({ queryKey: campKeys.leaderboard(event.campId) })
      break
    case 'chat:message':
      queryClient.setQueryData(campKeys.chat(event.campId, event.groupId), (prev) => {
        const list = Array.isArray(prev) ? prev : []
        return [...list, event.message]
      })
      break
  }
}
