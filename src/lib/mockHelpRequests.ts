import type { HelpRequest } from '../api/services/helpRequests.service'

/*
  Mock backing store for organizer-facing SOS / help requests. Safety is a
  first-class concern (Context.md §5, ReadyProduct §6), so the dashboard surfaces
  any ACTIVE request the moment it opens. `helpRequestsService` is the swap seam;
  in production this list arrives over the realtime bridge, not a poll.

  Ships with one active request so the banner is visible during development — set
  this to `[]` to preview the "all safe" state.
*/
export const helpRequestsMock: HelpRequest[] = [
  {
    id: 'help-1',
    campId: 'yoshlar-2026',
    participantId: 'p-iroda',
    participantName: 'Iroda B.',
    initials: 'IB',
    avatarColor: '#c97b5a',
    reason: 'lost',
    groupName: 'River Hawks',
    zone: 'Lake trail',
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    status: 'active',
  },
]
