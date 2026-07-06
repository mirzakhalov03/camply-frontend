import { useEffect, useState } from 'react'
import { LANGUAGES, translations } from '../../i18n/translations'

const CYCLE_MS = 2600

// Shared type styling so the invisible sizers match the visible word exactly.
const WORD_CLASS =
  'col-start-1 row-start-1 font-display text-[clamp(2.5rem,10vw,4.25rem)] font-bold leading-[1.1] tracking-tight'

/*
  The hero: the word "Welcome" in all three languages, always cross-fading
  UZ → RU → EN on a loop. It cycles independently of the language switcher — the
  switcher controls the UI (CTA, labels); the headline is a constant trilingual
  greeting.

  Zero layout shift: every translation is rendered into the *same* grid cell —
  the three invisible ones act as sizers, so the cell always reserves the height
  of the tallest word (e.g. the two-line Russian) at the current viewport width.
  The visible word is centered on top and cross-fades in on each swap. Because
  the slot never resizes, nothing below the headline moves.

  Accessibility: the loop would spam a live region, so the heading exposes one
  stable accessible name and the animating words are hidden from assistive tech.
*/
export function AnimatedWelcome() {
  const [cycleIndex, setCycleIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCycleIndex((i) => (i + 1) % LANGUAGES.length)
    }, CYCLE_MS)
    return () => clearInterval(id)
  }, [])

  const shownLang = LANGUAGES[cycleIndex]
  const text = translations[shownLang].login.welcome

  return (
    <h1
      aria-label={translations.en.login.welcome}
      className="grid grid-cols-1 grid-rows-1 place-items-center px-2 text-center"
    >
      {/* Sizers: reserve space for the tallest translation, invisible + ignored. */}
      {LANGUAGES.map((lang) => (
        <span key={lang} aria-hidden className={`${WORD_CLASS} invisible`}>
          {translations[lang].login.welcome}
        </span>
      ))}

      {/* Visible word — keyed so the cross-fade replays on every swap. */}
      <span
        key={shownLang}
        lang={shownLang}
        aria-hidden
        className={`${WORD_CLASS} animate-welcome-in bg-gradient-to-b from-deep to-pine bg-clip-text text-transparent`}
      >
        {text}
      </span>
    </h1>
  )
}
