import { useOutletContext } from 'react-router-dom'
import type { OrganizerCamp } from '../../../api/services/camps.service'

/*
  Context shared with every camp-detail TAB via <Outlet context>. The shell loads
  the camp once and hands it down, so tabs read `camp` (and `camp.id` for their own
  camp-scoped queries) without refetching the meta. This is the NEAREST outlet
  context inside a tab — distinct from the org shell's OrgContext one level up.
*/
export type CampDetailContext = {
  camp: OrganizerCamp
}

export function useCampDetail() {
  return useOutletContext<CampDetailContext>()
}
