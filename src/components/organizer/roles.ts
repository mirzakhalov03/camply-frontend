/*
  The seven organizer roles as stable keys, kept separate from the RolePicker
  component so both it and OrganizerInfoForm can import them without tripping the
  fast-refresh rule (a component file should only export components). Visible
  labels are resolved via i18n (t.organizer.roles[key]) so the keys stay
  trilingual. Order is the design's order.
*/
export const ORGANIZER_ROLES = [
  'projectManager',
  'coordinator',
  'admin',
  'media',
  'brandFace',
  'eventManager',
  'photographer',
] as const

export type OrganizerRole = (typeof ORGANIZER_ROLES)[number]

// One emoji per role, chosen to fit the job. Language-independent, so it lives
// here with the keys rather than being duplicated across every i18n bundle.
export const ROLE_EMOJI: Record<OrganizerRole, string> = {
  projectManager: '📋',
  coordinator: '🧭',
  admin: '🔑',
  media: '🎬',
  brandFace: '⭐',
  eventManager: '🎪',
  photographer: '📸',
}
