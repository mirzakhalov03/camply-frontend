import type { ReactNode } from 'react'

type Props = {
  /** Which panel is showing (0-based). Changing it slides the track. */
  index: number
  /** The full-screen panels, laid side by side left→right. */
  panels: ReactNode[]
}

/*
  A horizontal slide between full-screen onboarding steps. All panels stay
  mounted side by side in a track; changing `index` translates the track so the
  next screen scrolls in from the right (and back to the left). The offscreen
  panel is marked inert + aria-hidden so it can't be focused or read while parked.
  Honors reduced-motion by dropping the transition.
*/
export function OnboardingPager({ index, panels }: Props) {
  const count = panels.length

  return (
    <div className="h-dvh w-full overflow-hidden">
      <div
        className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(-${index * (100 / count)}%)`,
        }}
      >
        {panels.map((panel, i) => (
          <div
            key={i}
            className="h-full flex-none overflow-hidden"
            style={{ width: `${100 / count}%` }}
            aria-hidden={i !== index}
            inert={i !== index}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  )
}
