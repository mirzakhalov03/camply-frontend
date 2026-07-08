import { interpolate } from './interpolate'

/*
  Turns an ISO UTC timestamp into a localized label. The contract stores absolute
  UTC; formatting is a VIEW concern computed here. All wording — including month
  names — comes from the `time` i18n namespace, NOT Intl: browser ICU data for the
  `uz` locale is incomplete (it renders months as "M07"), so we own the strings to
  guarantee correct EN/UZ/RU output on every device. Time is 24h everywhere.
*/
export type TimeStrings = {
  justNow: string
  minAgo: string
  hoursAgo: string
  daysAgo: string
  /** 12 short month names, January → December. */
  months: string[]
}

function fmtDate(d: Date, months: string[]): string {
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function fmtTime(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

/** "just now" / "20 min ago" / "3h ago" / "2d ago" / an absolute date past a week. */
export function relativeTime(iso: string, s: TimeStrings): string {
  const diffSec = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const min = Math.floor(diffSec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)

  if (min < 1) return s.justNow
  if (min < 60) return interpolate(s.minAgo, { count: min })
  if (hr < 24) return interpolate(s.hoursAgo, { count: hr })
  if (day < 7) return interpolate(s.daysAgo, { count: day })
  return fmtDate(new Date(iso), s.months)
}

/** Absolute date + 24h time for the detail header, e.g. "9 iyul, 07:00". */
export function absoluteDateTime(iso: string, s: TimeStrings): string {
  const d = new Date(iso)
  return `${fmtDate(d, s.months)}, ${fmtTime(d)}`
}

/*
  Day-group label for the feed: "Today" / "Yesterday" / an absolute date. Compares
  calendar days in local time so 23:59 and 00:01 fall on the right side.
*/
export function dayBucketLabel(
  iso: string,
  s: TimeStrings,
  labels: { today: string; yesterday: string },
): string {
  const d = new Date(iso)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const dayDiff = Math.round((startOf(new Date()) - startOf(d)) / 86_400_000)
  if (dayDiff <= 0) return labels.today
  if (dayDiff === 1) return labels.yesterday
  return fmtDate(d, s.months)
}
