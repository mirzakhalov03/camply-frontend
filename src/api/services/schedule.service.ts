import { axiosInstance } from '../axiosInstance'

/*
  The schedule SERVICE — the backend boundary for the participant timeline. The
  types here are the DATA CONTRACT the organizer dashboard + backend will fill; the
  UI depends on these shapes, never on where data comes from. No React here.

  Status is DERIVED from timestamps (activityStatus), never stored, because
  done/now/upcoming is relative to the current moment.
*/

/** Who an activity is for: the whole camp, or one group. */
export type ActivityScope = { kind: 'camp' } | { kind: 'group'; groupId: string; groupName: string }

export type Activity = {
  id: string
  campId: string
  title: string
  location: string
  /** ISO 8601 UTC — organizer-authored. The UI formats it per language. */
  startsAt: string
  endsAt: string
  scope: ActivityScope
  /** Organizer-authored detail; part of the contract, not rendered yet. */
  description?: string | null
}

export type ActivityStatus = 'done' | 'now' | 'upcoming'

/** One calendar day's worth of activities (for the day-selector strip). */
export type ScheduleDay = {
  /** Stable local-date key `YYYY-MM-DD`, used for selection + React keys. */
  key: string
  /** Local midnight of the day, for label formatting. */
  date: Date
  isToday: boolean
  activities: Activity[]
}

/** Derive status by comparing the activity window to `now`. Single source of truth. */
export function activityStatus(a: Activity, now: Date = new Date()): ActivityStatus {
  const start = new Date(a.startsAt).getTime()
  const end = new Date(a.endsAt).getTime()
  const t = now.getTime()
  if (t >= end) return 'done'
  if (t >= start) return 'now'
  return 'upcoming'
}

// Local-date key so 23:59 and 00:01 land on the correct day (not UTC).
function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Group activities by local calendar day, each day sorted by start, days ascending. */
export function groupIntoDays(activities: Activity[], now: Date = new Date()): ScheduleDay[] {
  const todayKey = dayKey(now)
  const buckets = new Map<string, Activity[]>()

  for (const act of activities) {
    const key = dayKey(new Date(act.startsAt))
    const list = buckets.get(key)
    if (list) list.push(act)
    else buckets.set(key, [act])
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => {
      const [y, m, d] = key.split('-').map(Number)
      return {
        key,
        date: new Date(y, m - 1, d),
        isToday: key === todayKey,
        activities: [...list].sort((x, y2) => x.startsAt.localeCompare(y2.startsAt)),
      }
    })
}

/** Today's activities, sorted by start. The full schedule screen shows all of them. */
export function pickToday(activities: Activity[], now: Date = new Date()): Activity[] {
  const todayKey = dayKey(now)
  return activities
    .filter((a) => dayKey(new Date(a.startsAt)) === todayKey)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** How many of today's activities the HOME widget shows at once (a sliding window). */
export const HOME_WINDOW_SIZE = 4

/*
  The HOME "Today's schedule" window — a CLIENT display rule, not a backend concern.
  The backend serves the whole day and the organizer authors the whole day; this only
  decides which slice the compact home widget shows (the full schedule screen shows
  every activity).

  It shows a batch of `size` activities — INCLUDING passed ones — that advances one
  batch at a time: the visible set stays put until its LAST item is done, then jumps
  to the next batch. For the final partial batch it backfills from earlier (finished)
  activities so the widget always shows a full `size` when the day has at least that
  many. Days with fewer than `size` activities show them all.

    size 4:  6 today → [0,1,2,3] then [2,3,4,5]   (2 finished + 2 new)
             7 today → [0,1,2,3] then [3,4,5,6]   (1 finished + 3 new)
             3 today → [0,1,2]                     (fewer than 4 → all)
*/
export function pickTodayWindow(
  activities: Activity[],
  now: Date = new Date(),
  size: number = HOME_WINDOW_SIZE,
): Activity[] {
  const today = pickToday(activities, now)
  const n = today.length
  if (n <= size) return today

  // First activity not yet finished (the current/next one); n once the day is over.
  let firstActive = today.findIndex((a) => activityStatus(a, now) !== 'done')
  if (firstActive === -1) firstActive = n

  // The batch that activity falls in (batches step by `size`), clamped so the window
  // never runs past the end — the last batch backfills from earlier finished items.
  const batchStart = Math.floor(firstActive / size) * size
  const start = Math.max(0, Math.min(batchStart, n - size))
  return today.slice(start, start + size)
}

/** The next relevant activity (happening now, else soonest upcoming). Null if none. */
export function pickUpNext(activities: Activity[], now: Date = new Date()): Activity | null {
  const relevant = activities
    .filter((a) => activityStatus(a, now) !== 'done')
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  return relevant[0] ?? null
}

function sortByStart(list: Activity[]): Activity[] {
  return [...list].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

/** What the organizer submits to create an activity — everything but the id. */
export type NewActivity = Omit<Activity, 'id'>

/*
  A partial edit. Mirrors the server's `updateActivitySchema`, which is
  `createActivitySchema.partial()` — so every creatable field is individually
  patchable and nothing else is accepted.
*/
export type ActivityPatch = Partial<NewActivity>

export const scheduleService = {
  list: async (campId: string): Promise<Activity[]> => {
    return sortByStart((await axiosInstance.get<Activity[]>(`/camps/${campId}/schedule`)).data)
  },

  /** Organizer creates an activity. Returns the created record. */
  create: async (activity: NewActivity): Promise<Activity> => {
    return (await axiosInstance.post<Activity>(`/camps/${activity.campId}/schedule`, activity)).data
  },

  /** Organizer edits an activity. Returns the updated record. */
  update: async (campId: string, activityId: string, patch: ActivityPatch): Promise<Activity> => {
    return (await axiosInstance.patch<Activity>(`/camps/${campId}/schedule/${activityId}`, patch))
      .data
  },

  /** Organizer removes an activity. Destructive and not undoable — confirm first. */
  remove: async (campId: string, activityId: string): Promise<void> => {
    await axiosInstance.delete(`/camps/${campId}/schedule/${activityId}`)
  },
}
