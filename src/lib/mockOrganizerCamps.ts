import type { OrganizerCamp, OrganizerSummary } from '../api/services/camps.service'

/*
  Mock backing store for the ORGANIZER dashboard — the sibling of mockCamp.ts on
  the participant side. Stands in for the database until the backend exists; the
  ONLY file that hardcodes the organizer's camps. `campsService` (camps.service.ts)
  is the seam where this gets swapped for a real API call, so the shapes here are
  the data contract the backend must return.
*/

export const organizerSummaryMock: OrganizerSummary = {
  organizerName: 'Madina',
  organizationName: 'Yoshlar Foundation',
  totalParticipants: 312,
  activeCamps: 3,
  totalGroups: 16,
  unreadChat: 2,
  onSite: 246,
}

export const organizerCampsMock: OrganizerCamp[] = [
  {
    id: 'yoshlar-2026',
    name: 'Yoshlar Summer Camp 2026',
    location: 'Chimgan',
    dateRange: 'Jul 6 – Jul 19',
    status: 'active',
    participantCount: 248,
    groupCount: 12,
    organizerCount: 9,
    checkinPct: 86,
    dayCurrent: 6,
    dayTotal: 14,
    coverImage: null,
  },
  {
    id: 'leaders-lab',
    name: 'Leaders Lab · Autumn',
    location: 'Samarkand',
    dateRange: 'Sep 2 – Sep 12',
    status: 'upcoming',
    participantCount: 40,
    groupCount: 3,
    organizerCount: 4,
    checkinPct: 0,
    dayCurrent: 0,
    dayTotal: 11,
    coverImage: null,
  },
  {
    id: 'winter-bootcamp',
    name: 'Winter Coding Bootcamp',
    location: 'Tashkent',
    dateRange: 'Draft',
    status: 'draft',
    participantCount: 24,
    groupCount: 1,
    organizerCount: 2,
    checkinPct: 0,
    dayCurrent: 0,
    dayTotal: 0,
    coverImage: null,
  },
]
