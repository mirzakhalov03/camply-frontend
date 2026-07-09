import { useEffect, useRef } from 'react'

/*
  A timer-style scroll wheel for picking a point delta. Every integer from -20..+20
  (positive at the TOP, so scrolling up = more points). Uses native CSS scroll-snap —
  no physics library — and reads the centered snapped item back as the value. The
  selected value sits on a solid pine band (white text) so it stays legible; the wheel
  lives in its own sheet so its vertical scroll never fights a surrounding list.
*/
const STEP = 1
const MAX = 20
const VALUES = Array.from({ length: (MAX * 2) / STEP + 1 }, (_, i) => MAX - i * STEP)
const ITEM_H = 40 // px per row; the center slot is one item tall
const PAD = 80 // (viewport 200 / 2) - (ITEM_H / 2), so first/last value can center

export function PointsWheel({
  value,
  onChange,
  ariaLabel,
}: {
  value: number
  onChange: (v: number) => void
  ariaLabel: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Position the current value at center on mount (instant, no smooth scroll).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = VALUES.indexOf(value) * ITEM_H
    // Run once on mount; later positioning is driven by user scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const idx = Math.round(el.scrollTop / ITEM_H)
    const next = VALUES[Math.max(0, Math.min(idx, VALUES.length - 1))]
    if (next !== value) onChange(next)
  }

  return (
    <div
      className="relative mx-auto h-[200px] w-40 overflow-hidden"
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={-MAX}
      aria-valuemax={MAX}
    >
      {/* Solid pine band marking the selected slot (the selected number sits on it). */}
      <div className="pointer-events-none absolute inset-x-2 top-1/2 h-10 -translate-y-1/2 rounded-input bg-pine shadow-[0_4px_12px_rgba(15,107,79,0.28)]" />
      {/* Soft fades top & bottom so off-center numbers recede. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-surface-2 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-surface-2 to-transparent" />
      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full snap-y snap-mandatory overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div style={{ height: PAD }} />
        {VALUES.map((v) => (
          <div
            key={v}
            className={`relative z-0 flex h-10 snap-center items-center justify-center tabular-nums transition ${
              v === value
                ? 'text-subhead font-extrabold text-white'
                : 'text-heading font-bold text-muted/40'
            }`}
          >
            {v > 0 ? `+${v}` : v}
          </div>
        ))}
        <div style={{ height: PAD }} />
      </div>
    </div>
  )
}
