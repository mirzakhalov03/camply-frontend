/*
  Placeholder for the real participant lookup. The backend/organizer roster isn't
  wired up yet, so we check the entered number against a hardcoded list. Values
  are national digits only (no +998, no separators) — the same shape PhoneInput
  emits. Swap this whole module for an API call when auth lands.
*/
const KNOWN_PARTICIPANTS = new Set(['901234567', '911234567', '931234567'])

/** True if the national digits belong to a known participant. */
export function isKnownParticipant(digits: string): boolean {
  return KNOWN_PARTICIPANTS.has(digits)
}
