/*
  The one loading placeholder. A pulsing token-colored block — compose several to
  build any screen's skeleton (see HomeSkeleton, RanksSkeleton) instead of each
  re-declaring the pulse + color. `tone` matches what the real content sits on:
  `surface` for card-shaped blocks, `line`/`soft` for inline bits. ReadyProduct §9
  wants a loading state on every screen; this is the building block.
*/
type Tone = 'line' | 'soft' | 'surface'

const TONES: Record<Tone, string> = {
  line: 'bg-line',
  soft: 'bg-soft',
  surface: 'bg-surface',
}

type Props = {
  className?: string
  tone?: Tone
}

export function Skeleton({ className = '', tone = 'line' }: Props) {
  return <div className={`animate-pulse rounded-xl ${TONES[tone]} ${className}`} />
}
