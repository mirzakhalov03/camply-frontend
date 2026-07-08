/*
  Two-letter initials from a display name: "Jasur Karimov" → "JK", "Dilnoza" → "D".
  Used wherever an Avatar needs a fallback tile and the data only has a full name.
*/
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}
