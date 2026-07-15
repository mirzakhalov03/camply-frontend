import type { HelpRequest } from '@/api/services/helpRequests.service'

/*
  Mock backing store for organizer-facing SOS / help requests. Safety is a
  first-class concern (Context.md §5, ReadyProduct §6), so the dashboard surfaces
  any ACTIVE request the moment it opens. `helpRequestsService` is the swap seam;
  in production this list arrives over the realtime bridge, not a poll.

  Starts empty — the dashboard shows the "all safe" state until a real SOS arrives
  (over the realtime bridge in production). Add a seed object here temporarily if you
  need to preview the active-alert banner during development.
*/
export const helpRequestsMock: HelpRequest[] = []
