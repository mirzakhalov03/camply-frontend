/*
  Uzbek phone helpers (first market). Kept separate from the input component so
  both stay single-purpose and these can be reused wherever phones are shown.
*/

export const PHONE_LENGTH = 9

/** Format up to 9 raw digits as the Uzbek pattern: 90 123-45-67. */
export function formatUzPhone(digits: string): string {
  const d = digits.slice(0, PHONE_LENGTH)
  let out = d.slice(0, 2)
  if (d.length > 2) out += ' ' + d.slice(2, 5)
  if (d.length > 5) out += '-' + d.slice(5, 7)
  if (d.length > 7) out += '-' + d.slice(7, 9)
  return out
}

/** Strip everything but digits and cap at the national number length. */
export function toPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PHONE_LENGTH)
}

/*
  Display a STORED number (canonical E.164, e.g. +998940002007) as '+998 94 000-20-07'.

  Distinct from toPhoneDigits, which is for INPUT: that one takes the first 9 digits,
  so handed a stored number it would return the country code ('998940002') instead of
  the subscriber number. This mirrors the backend's canonicalizePhone by dropping a
  leading 998, and falls back to the raw string if the shape is unexpected — a weird
  number should render visibly odd, not silently mangled.
*/
export function formatStoredPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  const national = digits.startsWith('998') ? digits.slice(3) : digits
  return national.length === PHONE_LENGTH ? `+998 ${formatUzPhone(national)}` : e164
}
