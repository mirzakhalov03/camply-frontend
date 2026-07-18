/*
  Design-system color token → CSS variable reference.

  Member avatar colors arrive from the server as palette TOKENS ('pine', 'sky', …)
  via utils/avatar#colorFor. Resolving them to var(--color-<token>) is what keeps
  those tiles correct in DARK MODE: index.css redefines these variables per theme,
  so a hard-coded value would freeze them to the light palette.

  Group colors are a different story — organizers picked those, and existing data
  stores them as raw hex despite group.model.ts calling them tokens. Anything that
  isn't a known token is therefore passed through UNCHANGED rather than forced
  into the palette, which would silently repaint an amber group green.
*/
const PALETTE_TOKENS = ['pine', 'amber', 'sky', 'deep'] as const

export function paletteColor(value: string): string {
  return (PALETTE_TOKENS as readonly string[]).includes(value) ? `var(--color-${value})` : value
}
