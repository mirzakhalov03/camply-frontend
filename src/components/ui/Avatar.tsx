import type { CSSProperties } from 'react'

/*
  The one avatar. A photo when we have one, initials on a colored tile when we
  don't — the exact fallback the roster, chat, leaderboard, and profile all need.
  `color` is runtime data (a group/member color) applied inline; it defaults to
  pine so the component is safe without one. Callers pick a `size` preset or pass
  a pixel number for one-offs (e.g. the 104px profile hero).
*/
type SizePreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<SizePreset, number> = { xs: 28, sm: 36, md: 48, lg: 64, xl: 80 }

type Props = {
  /** Accessible name (also the img alt). */
  name: string
  initials: string
  photo?: string | null
  /** Tile background when there's no photo. Runtime data → inline style. */
  color?: string
  size?: SizePreset | number
  /** Optional ring (e.g. a surface-colored border where avatars overlap). */
  ring?: boolean
  className?: string
  style?: CSSProperties
}

export function Avatar({
  name,
  initials,
  photo,
  color = 'var(--color-pine)',
  size = 'md',
  ring = false,
  className = '',
  style,
}: Props) {
  const px = typeof size === 'number' ? size : SIZES[size]
  // Initials read best at ~40% of the tile; caps out so xl doesn't look shouty.
  const fontPx = Math.round(Math.min(px * 0.4, 34))

  return (
    <span
      className={`inline-flex flex-none items-center justify-center overflow-hidden rounded-full font-bold text-white ${
        ring ? 'border-2 border-surface' : ''
      } ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: fontPx,
        backgroundColor: photo ? undefined : color,
        ...style,
      }}
    >
      {photo ? (
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  )
}
