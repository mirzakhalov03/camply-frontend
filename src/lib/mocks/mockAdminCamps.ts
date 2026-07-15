import type { AdminCamp } from '@/api/services/adminCamps.service'

/*
  Mock camps for the ORGANIZATION admin view. Emptied — the Camps screen now renders
  its empty state. This is still the mock→real seam: when the backend gains a camps
  domain, the real GET /camps response replaces this. Sample fixture rows (one per
  status) are in git history if you need them back.
*/
export const adminCampsMock: AdminCamp[] = []
