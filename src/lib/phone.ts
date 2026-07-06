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
