/*
  Canonical camp-groups list — the ONE place group identity (id, name, color) is
  defined. Group names are proper nouns, so they stay literal in every language
  (same call as lib/cities.ts), never routed through i18n.

  Read statically today, exactly like CITIES feeds CityPicker. Groups are
  ultimately camp-scoped server data: when camp-selection + the backend land this
  becomes a `useCampGroups(campId)` fetch (see the lib/<domain>.ts data boundary).
  For now every group-selection surface reads CAMP_GROUPS.
*/
export type CampGroup = {
  id: string
  name: string
  /** Brand-palette color for the group's swatch. Applied as an inline style. */
  color: string
}

export const CAMP_GROUPS: CampGroup[] = [
  { id: 'foxes', name: 'Summit Foxes', color: '#e0982a' },
  { id: 'wolves', name: 'Pine Wolves', color: '#0f6b4f' },
  { id: 'hawks', name: 'River Hawks', color: '#5aa9c4' },
  { id: 'blazers', name: 'Trail Blazers', color: '#c97b5a' },
  { id: 'otters', name: 'Lake Otters', color: '#3f9d8e' },
  { id: 'eagles', name: 'Camp Eagles', color: '#5f7d6a' },
]
