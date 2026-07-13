/*
  Fills {tokens} in a translated string, e.g.
    interpolate('Welcome, {name}!', { name: 'Ada' }) → 'Welcome, Ada!'
  Keeping this tiny + separate means every translated template (counts, names,
  regions) uses the same rule, and languages can put the token wherever their
  grammar needs it.
*/
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`))
}
