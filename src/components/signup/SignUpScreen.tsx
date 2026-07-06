import { useRef, useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useTypewriter } from '../../lib/useTypewriter'
import type { City } from '../../lib/cities'
import { OnboardingProgress } from '../OnboardingProgress'
import { AvatarBadge } from './AvatarBadge'
import { CityPicker } from './CityPicker'
import { AgeStepper } from './AgeStepper'
import { SignUpSuccess } from './SignUpSuccess'

type Props = {
  /** Slide back to the previous (congratulations) screen. */
  onBack?: () => void
  /** Final step after the badge is created — no home screen exists yet. */
  onEnterCamp?: () => void
  /** True once this screen is the visible step — gates the title typewriter. */
  active?: boolean
}

const DEFAULT_AGE = 16

/*
  Participant profile setup — the "step 2" onboarding screen after a camper is
  confirmed on the roster. A green hero over a paper form: name, home city, and
  age, with a live camp-badge avatar that fills in as they type. Submitting a
  complete profile reveals the success overlay. Owns all form state locally
  (ephemeral UI data, not server state), matching the project's client/server
  split.
*/
export function SignUpScreen({ onBack, onEnterCamp, active = true }: Props) {
  const { t } = useTranslation()

  // Type the hero title out once this screen is the active step (and on language
  // change). Gated by `active` so it doesn't type while parked offscreen.
  const { shown: typedTitle, done: titleDone } = useTypewriter(t.signup.title, { start: active })

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [city, setCity] = useState<City | null>(null)
  const [age, setAge] = useState(DEFAULT_AGE)
  const [photo, setPhoto] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Hidden native file input, triggered by tapping the avatar. We read the
  // chosen image as a data URL so it can render immediately with no upload/server
  // (that wiring comes later, when profiles are persisted).
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be re-picked later
    // `accept` is only a hint — guard against a non-image slipping through.
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const trimmedName = name.trim()
  const trimmedSurname = surname.trim()
  const initials = ((trimmedName[0] ?? '') + (trimmedSurname[0] ?? '')).toUpperCase()
  const valid = Boolean(trimmedName && trimmedSurname && city)

  const bracket =
    age < 13 ? t.signup.bracketJunior : age <= 17 ? t.signup.bracketTeen : t.signup.bracketSenior

  const submit = () => {
    if (valid) setSubmitted(true)
  }

  return (
    <div className="relative h-full overflow-hidden bg-paper text-ink">
      <div className="h-full overflow-y-auto">
        {/* ── Green hero ── */}
        {/* Top padding respects a phone notch (safe-area) but stays tight
            otherwise, so the back button sits close to the top edge. */}
        <div className="relative overflow-hidden bg-[linear-gradient(180deg,#0f6b4f_0%,#0a5039_100%)] px-6 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
          {/* items-start pins the progress dots to the hero's top padding so they
              line up with the same figure on the congratulations screen (which
              sits at the identical top offset). */}
          <div className="flex items-start justify-between">
            <button
              type="button"
              onClick={onBack}
              aria-label={t.notfound.back}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/15 transition-colors hover:bg-white/25"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path
                  d="M11 4l-5 5 5 5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Profile setup is step 2 of the onboarding. */}
            <OnboardingProgress step={2} />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f4d9a8]">
            {t.signup.eyebrow}
          </p>
          {/* Typewriter title. The full text is the accessible name; the
              animating characters + caret are hidden from assistive tech. A
              min-height reserves the two-line slot so nothing below jumps as it
              types. */}
          <h1
            aria-label={t.signup.title}
            className="mt-2 min-h-[2.4em] font-display text-[27px] font-bold leading-tight tracking-tight"
          >
            <span aria-hidden>
              {typedTitle}
              <span
                className={`ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[2px] rounded-full bg-[#f4d9a8] ${
                  titleDone ? 'animate-caret' : ''
                }`}
              />
            </span>
          </h1>
          <p className="mt-2.5 max-w-[280px] text-[13.5px] leading-relaxed text-white/80">
            {t.signup.subtitle}
          </p>
        </div>

        {/* ── Paper form sheet (overlaps the hero) ── */}
        <div className="relative -mt-7 rounded-t-[28px] bg-paper px-5.5 pb-10">
          {/* Live avatar straddling the seam — tap it (or the "+") to add a photo */}
          <div className="-mt-11 flex justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
            <AvatarBadge
              initials={initials}
              photo={photo}
              onUploadClick={() => fileInputRef.current?.click()}
              label={t.signup.uploadPhoto}
            />
          </div>
          <p className="mt-2.5 text-center font-mono text-[11px] tracking-[0.04em] text-[#9aa79f]">
            {photo ? `● ${t.signup.photoUploaded}` : t.signup.badgeEmpty}
          </p>

          {/* Name + surname */}
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
            {t.signup.nameLabel}
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <NameInput value={name} onChange={setName} placeholder={t.signup.firstName} />
            <NameInput value={surname} onChange={setSurname} placeholder={t.signup.surname} />
          </div>

          {/* Home city */}
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
            {t.signup.cityLabel}
          </p>
          <div className="mt-2.5">
            <CityPicker value={city} onChange={setCity} />
          </div>

          {/* Age */}
          <div className="mt-5 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
              {t.signup.ageLabel}
            </p>
            <p className="font-mono text-[11px] text-[#b7bdb2]">{bracket}</p>
          </div>
          <div className="mt-2.5">
            <AgeStepper age={age} onChange={setAge} />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={submit}
            disabled={!valid}
            className={[
              'mt-6 flex h-[58px] w-full items-center justify-center gap-2.5 rounded-full font-display text-[16.5px] font-bold transition-all',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
              valid
                ? 'bg-[#ef9d20] text-[#3a2807] shadow-[0_10px_24px_rgba(239,157,32,0.36)] hover:-translate-y-0.5 active:translate-y-0'
                : 'cursor-not-allowed bg-[#e9e3d5] text-[#a9b0a8]',
            ].join(' ')}
          >
            <span>{valid ? t.signup.enterValid : t.signup.enterInvalid}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M4 10h11M11 5l5 5-5 5"
                stroke={valid ? '#3a2807' : '#a9b0a8'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <p className="mt-3.5 text-center text-xs leading-relaxed text-[#9aa79f]">
            {t.signup.consentBefore}{' '}
            <span className="font-semibold text-pine">{t.signup.consentLink}</span>{' '}
            {t.signup.consentAfter}
          </p>
        </div>
      </div>

      {submitted && (
        <SignUpSuccess
          initials={initials}
          photo={photo}
          name={trimmedName}
          onEnterCamp={onEnterCamp}
          onEdit={() => setSubmitted(false)}
        />
      )}
    </div>
  )
}

/*
  Small local input used for both name fields — same look, so it lives here
  rather than as a shared component (only this screen uses it). The green focus
  ring matches the design's field-focus state.
*/
function NameInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={40} // sane cap so a name can't overflow the badge / layout
      className="h-[52px] w-full rounded-[16px] border-[1.5px] border-[#e7e1d3] bg-[#fffdf8] px-[15px] text-[15px] font-semibold text-ink shadow-[0_3px_10px_rgba(20,40,30,0.04)] outline-none transition-colors placeholder:font-medium placeholder:text-[#a9b0a8] focus:border-pine focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,107,79,0.12)]"
    />
  )
}
