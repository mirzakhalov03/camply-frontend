import type { Activity } from '../api/services/schedule.service'
import { CURRENT_CAMP_ID } from '../api/services/announcements.service'

/*
  Mock backing store for the schedule — the ONLY file that hardcodes example
  activities. scheduleService.list() is the seam where this is swapped for a real
  API call. Timestamps are anchored to `new Date()` at import time so the demo
  always shows a believable done / now / upcoming no matter when it runs — matching
  Camply's freshness-first philosophy.
*/

// A fixed clock time (hour:minute) on the day `dayOffset` days from today, local.
function at(dayOffset: number, hour: number, minute: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// Minutes from *right now* — used to guarantee today has a live "now" item.
function fromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

let seq = 0
const nextId = () => `act_${++seq}`

const PINE_WOLVES = { kind: 'group', groupId: 'grp_pine', groupName: 'Pine Wolves' } as const
const CAMP = { kind: 'camp' } as const

// Fixed-clock activity on a given day offset.
function a(
  day: number,
  start: [number, number],
  end: [number, number],
  title: string,
  location: string,
  scope: Activity['scope'],
): Activity {
  return {
    id: nextId(),
    campId: CURRENT_CAMP_ID,
    title,
    location,
    startsAt: at(day, start[0], start[1]),
    endsAt: at(day, end[0], end[1]),
    scope,
  }
}

// Activity defined relative to *now* (minutes), for today's live trio.
function rel(
  startMin: number,
  endMin: number,
  title: string,
  location: string,
  scope: Activity['scope'],
): Activity {
  return {
    id: nextId(),
    campId: CURRENT_CAMP_ID,
    title,
    location,
    startsAt: fromNow(startMin),
    endsAt: fromNow(endMin),
    scope,
  }
}

export const scheduleMock: Activity[] = [
  // Three days ago — camp opening (all done)
  a(-3, [15, 0], [16, 0], 'Arrival & Check-in', 'Main Gate', CAMP),
  a(-3, [18, 0], [19, 0], 'Opening Ceremony', 'Amphitheater', CAMP),
  a(-3, [19, 30], [21, 0], 'Welcome Dinner', 'Mess Hall', CAMP),
  // Two days ago (all done)
  a(-2, [8, 0], [9, 0], 'Morning Run', 'Lakeside trail', CAMP),
  a(-2, [10, 0], [12, 0], 'Team Challenge', 'Field', CAMP),
  a(-2, [20, 0], [21, 30], 'Campfire', 'Fire Pit', CAMP),
  // Yesterday (all done)
  a(-1, [9, 30], [11, 0], 'Robotics Lab', 'Tech Tent', PINE_WOLVES),
  a(-1, [13, 0], [14, 0], 'Lunch', 'Mess Hall', CAMP),
  a(-1, [16, 0], [17, 30], 'Kayaking', 'Blue Lake', CAMP),
  // Today — anchored to the current moment so status is always live. Six items so
  // the home widget's 4-window (and its batch sliding) is visibly exercised.
  rel(-240, -180, 'Morning Run', 'Lakeside trail', CAMP), // done
  rel(-120, -60, 'Breakfast', 'Mess Hall', CAMP), // done
  rel(-30, 30, 'Robotics Lab', 'Tech Tent', PINE_WOLVES), // NOW
  rel(90, 150, 'Lunch', 'Mess Hall', CAMP), // upcoming
  rel(210, 270, 'Kayaking', 'Blue Lake', CAMP), // upcoming
  rel(360, 420, 'Campfire', 'Fire Pit', CAMP), // upcoming
  // Tomorrow (all upcoming)
  a(1, [9, 0], [11, 0], 'Hiking', 'North Ridge', CAMP),
  a(1, [14, 0], [16, 0], 'Photography Workshop', 'Art Cabin', PINE_WOLVES),
  // Day after (all upcoming)
  a(2, [10, 0], [12, 0], 'Rope Course', 'Adventure Zone', CAMP),
  a(2, [20, 0], [21, 30], 'Talent Show', 'Amphitheater', CAMP),
  // Final day — camp closing (all upcoming)
  a(3, [10, 0], [11, 30], 'Closing Ceremony', 'Amphitheater', CAMP),
  a(3, [12, 0], [13, 0], 'Farewell Lunch', 'Mess Hall', CAMP),
]
