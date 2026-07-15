/*
  Enumerate every calendar date in an inclusive [start, end] range as `YYYY-MM-DD`
  strings — the format native <input type="date"> and our activity dropdown use.
  Framework-free; iterates on UTC to avoid DST/local-midnight drift. Returns [] for
  invalid input or an end before start (callers render an empty dropdown, not a crash).
*/
export function datesInRange(startISO: string, endISO: string): string[] {
  const start = new Date(startISO)
  const end = new Date(endISO)
  if (Number.isNaN(+start) || Number.isNaN(+end) || end < start) return []

  const out: string[] = []
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
  while (cursor <= last) {
    out.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}
