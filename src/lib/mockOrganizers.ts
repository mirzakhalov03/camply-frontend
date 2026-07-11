/*
  Placeholder for the real organizer lookup — the sibling of mockParticipants.
  The backend isn't wired up yet, so we check the entered number against a
  hardcoded list. Values are national digits only (no +998, no separators) — the
  same shape PhoneInput emits. Swap this whole module for an API call when auth
  lands.

  Organizers are checked BEFORE participants at login, so a number here always
  opens the organizer flow.
*/
const KNOWN_ORGANIZERS = new Set(['999999999'])

/** True if the national digits belong to a known organizer. */
export function isKnownOrganizer(digits: string): boolean {
  return KNOWN_ORGANIZERS.has(digits)
}
