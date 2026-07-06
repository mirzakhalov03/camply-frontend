import type { ReactNode } from 'react'

type Props = {
  title: string
  message: string
  illustration: ReactNode
  actionLabel: string
  onAction?: () => void
}

/*
  Shared full-screen result layout on Camply's deep-green gradient: headline →
  illustration → message → pill button, with a staggered entrance. Both the
  success (Congratulations) and empty (Not found) screens are the same shape with
  different content, so they compose this instead of duplicating it.
*/
export function ResultScreen({ title, message, illustration, actionLabel, onAction }: Props) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[linear-gradient(160deg,#0a5039_0%,#0f6b4f_55%,#0c4231_100%)] px-6 text-paper">
      {/* Warm glow behind the illustration. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber/20 blur-3xl"
      />

      {/* Headline. Entrance delays are set inline because Tailwind's `animation`
          shorthand in the animate-* classes resets animation-delay, so a
          `[animation-delay:*]` utility would be overridden and the stagger lost. */}
      <h1 className="animate-rise-in relative pt-16 text-center font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>

      {/* Illustration */}
      <div className="relative flex flex-1 items-center justify-center">
        <div
          className="animate-pop-in h-64 w-64 sm:h-72 sm:w-72"
          style={{ animationDelay: '120ms' }}
        >
          {illustration}
        </div>
      </div>

      {/* Message + action */}
      <div className="relative flex flex-col items-center gap-8 pb-12">
        <p
          className="animate-rise-in max-w-sm text-center text-lg leading-relaxed text-paper/90"
          style={{ animationDelay: '220ms' }}
        >
          {message}
        </p>

        <button
          type="button"
          onClick={onAction}
          style={{ animationDelay: '320ms' }}
          className="animate-rise-in w-full max-w-md rounded-full bg-paper px-8 py-4 text-center font-display text-base font-semibold text-deep shadow-xl shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
