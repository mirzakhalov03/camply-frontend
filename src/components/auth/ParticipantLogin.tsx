import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { AnimatedWelcome } from './AnimatedWelcome'
import { PhoneInput } from './PhoneInput'
import { PHONE_LENGTH } from '../../lib/phone'
import { PineRidge } from './PineRidge'

type Props = {
  /**
   * Called with the full E.164 number (e.g. "+998901234567") on submit. The
   * caller decides where to navigate (success vs. not-found). Optional so the
   * screen is reusable before auth is wired up.
   */
  onSubmit?: (phone: string) => void
}

/*
  Participant Login / Landing — the first screen a camper sees. Composes the
  language switcher, the cycling welcome headline, and the phone form over a
  "dawn at camp" backdrop. It owns the phone digits and submit; language lives in
  the shared store via useTranslation, so the whole app stays in sync.
*/
export function ParticipantLogin({ onSubmit }: Props) {
  const { t, selectedLang, setLanguage } = useTranslation()
  const [phone, setPhone] = useState('')

  const isValid = phone.length === PHONE_LENGTH

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit?.(`+998${phone}`)
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[linear-gradient(180deg,var(--color-dawn-top)_0%,var(--color-dawn-mid)_58%,var(--color-dawn-glow)_100%)]">
      <PineRidge />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 py-3.5 sm:px-8">
        <a href="/" className="font-display text-xl font-bold tracking-tight text-deep">
          Camply
        </a>
        <LanguageSwitcher
          selected={selectedLang}
          onSelect={setLanguage}
          label={t.login.switchLanguage}
        />
      </header>

      {/* Center — anchored a touch above true center so the Welcome word and
          phone form sit higher, closer to the top bar. */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-28 pt-2">
        <div className="w-full max-w-md">
          <p className="mb-3 text-center font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-pine/70">
            {t.login.eyebrow}
          </p>

          {/* Soft dawn sun sitting directly behind the welcome word — the scene's
              warm light. Centered on the headline so it cradles the word whether
              it's one line or two. Rises gently on load. */}
          <div className="relative isolate">
            <div
              aria-hidden
              className="animate-sun-rise pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(246,205,130,0.6)_0%,rgba(224,152,42,0.14)_45%,transparent_70%)] blur-xl"
            />
            <AnimatedWelcome />
          </div>
          <p className="mx-auto mt-3 max-w-xs text-center text-[15px] leading-relaxed text-ink/60">
            {t.login.subtitle}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-[var(--radius-card)] border border-white/70 bg-white/85 p-5 shadow-[0_24px_60px_-24px_rgba(10,80,57,0.5)] backdrop-blur-md sm:p-6"
          >
            <PhoneInput
              value={phone}
              onChange={setPhone}
              label={t.login.phoneLabel}
              error={t.login.phoneError}
            />

            <button
              type="submit"
              disabled={!isValid}
              className={[
                'group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3.5',
                'font-display text-base font-semibold transition-all duration-300',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber',
                isValid
                  ? 'animate-cta-pop bg-gradient-to-r from-pine to-deep text-paper shadow-lg shadow-pine/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pine/40 active:translate-y-0 active:scale-[0.99]'
                  : 'cursor-not-allowed bg-ink/10 text-ink/40',
              ].join(' ')}
            >
              {/* Shine sweep on hover — only when the button is active. */}
              {isValid && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
                />
              )}
              <span className="relative">{t.login.cta}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className={`relative ${isValid ? 'animate-arrow-nudge' : ''}`}
              >
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
