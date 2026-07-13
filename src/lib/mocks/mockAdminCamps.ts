import type { AdminCamp } from '@/api/services/adminCamps.service'

/*
  Mock camps for the ORGANIZATION admin view — camps span multiple organizers, so
  each carries an organizerName (the org-view attribution the organizer's own list
  doesn't need). Covers each status so the Camps screen renders all states. Replaced
  by the real GET /camps response when the backend gains a camps domain.
*/
export const adminCampsMock: AdminCamp[] = [
  {
    id: 'camp-1',
    name: 'Summer Leadership Camp',
    organizerName: 'Aziz Karimov',
    location: 'Chimgan',
    dateRange: 'Jul 6 – Jul 19',
    status: 'active',
    participantCount: 128,
  },
  {
    id: 'camp-2',
    name: 'Code & Create Bootcamp',
    organizerName: 'Dilnoza Yusupova',
    location: 'Tashkent',
    dateRange: 'Aug 1 – Aug 14',
    status: 'upcoming',
    participantCount: 64,
  },
  {
    id: 'camp-3',
    name: 'Autumn Debate Intensive',
    organizerName: 'Aziz Karimov',
    location: 'Samarkand',
    dateRange: 'Sep 10 – Sep 20',
    status: 'draft',
    participantCount: 0,
  },
]
