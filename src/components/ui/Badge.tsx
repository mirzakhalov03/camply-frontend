import type { ReactNode } from 'react'

/*
  The one status pill — role badges, "YOU", camp states (Active/Upcoming/Draft),
  unread counts. Tones map to the semantic tint tokens so every pill re-themes in
  dark mode automatically. `solid` flips to a filled treatment for count badges.
*/
type Tone = 'pine' | 'amber' | 'danger' | 'muted'

const SOFT: Record<Tone, string> = {
  pine: 'bg-green-tint text-pine',
  amber: 'bg-amber-tint text-amber',
  danger: 'bg-danger-tint text-danger',
  muted: 'bg-soft text-muted',
}

const SOLID: Record<Tone, string> = {
  pine: 'bg-pine text-white',
  amber: 'bg-amber-bright text-amber-ink',
  danger: 'bg-danger text-white',
  muted: 'bg-muted text-white',
}

type Props = {
  tone?: Tone
  solid?: boolean
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'pine', solid = false, children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-meta font-bold ${
        solid ? SOLID[tone] : SOFT[tone]
      } ${className}`}
    >
      {children}
    </span>
  )
}
