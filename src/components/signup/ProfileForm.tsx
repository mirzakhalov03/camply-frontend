import { useRef, useState, type ReactNode } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useTypewriter } from '../../lib/useTypewriter'
import { useProfileStore } from '../../store/useProfileStore'
import type { City } from '../../lib/cities'
import { OnboardingProgress } from '../OnboardingProgress'
import { Button, Field } from '../ui'
import { AvatarBadge } from './AvatarBadge'
import { CityPicker } from './CityPicker'
import { AgeStepper } from './AgeStepper'

/** The completed profile handed to the success overlay on submit. */
export type ProfileData = {
  name: string
  surname: string
  city: City
  age: number
  photo: string | null
  initials: string
}

type Props = {
  // Hero copy (role-specific)
  eyebrow: string
  title: string
  subtitle: string
  // Submit button copy
  submitValid: string
  submitInvalid: string

  /** Slide back to the previous (congratulations) screen. */
  onBack?: () => void
  /** True once this screen is the visible step — gates the title typewriter. */
  active?: boolean

  /** Optional meta shown beside the Age label (participant age bracket). */
  ageBracket?: (age: number) => string
  /** Extra field(s) rendered between Age and the submit button (e.g. role chips). */
  extraFields?: ReactNode
  /** Extra validity gate, ANDed with the core fields (e.g. a role must be picked). */
  extraValid?: boolean
  /** Optional consent line under the submit button. */
  consent?: { before: string; link: string; after: string }

  /**
   * Full-screen overlay shown once a valid profile is submitted. Receives the
   * collected data plus an `onEdit` to dismiss the overlay and return to the form.
   */
  renderSuccess: (data: ProfileData, onEdit: () => void) => ReactNode
}

const DEFAULT_AGE = 16

/*
  Shared profile-setup form — the "step 2" onboarding screen. A green hero over a
  paper sheet: name + surname, home city, age, and a live badge avatar that fills
  in as you type. Owns all core field state locally (ephemeral UI data, not
  server state).

  Role-specific pieces are injected by the caller: hero copy, submit labels, an
  optional age bracket, an optional `extraFields` slot (the organizer's role
  picker), and the success overlay. This is why both SignUpScreen (participant)
  and OrganizerInfoForm (organizer) can be thin wrappers around it — mirroring how
  CongratulationsScreen / NotFoundScreen wrap the shared ResultScreen.
*/
export function ProfileForm({
  eyebrow,
  title,
  subtitle,
  submitValid,
  submitInvalid,
  onBack,
  active = true,
  ageBracket,
  extraFields,
  extraValid = true,
  consent,
  renderSuccess,
}: Props) {
  const { t } = useTranslation()
  // On submit we commit this form's data into the profile store so it survives
  // the jump into the app — the Profile screen reads it from there. Until then
  // the fields below stay local: transient form state, not the committed profile.
  const setRegistration = useProfileStore((s) => s.setRegistration)

  // Type the hero title out once this screen is the active step (and on language
  // change). Gated by `active` so it doesn't type while parked offscreen.
  const { shown: typedTitle, done: titleDone } = useTypewriter(title, { start: active })

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
  const valid = Boolean(trimmedName && trimmedSurname && city) && extraValid

  const submit = () => {
    if (!valid || !city) return
    setRegistration({ name: trimmedName, surname: trimmedSurname, city, age, photo, initials })
    setSubmitted(true)
  }

  return (
    <div className="relative h-full overflow-hidden bg-paper text-ink">
      <div className="h-full overflow-y-auto">
        {/* ── Green hero ── */}
        {/* Top padding respects a phone notch (safe-area) but stays tight
            otherwise, so the back button sits close to the top edge. */}
        <div className="relative overflow-hidden bg-gradient-to-b from-pine to-deep px-6 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
          {/* items-start pins the progress dots to the hero's top padding so they
              line up with the same figure on the congratulations screen. */}
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

          <p className="mt-6 text-meta font-semibold uppercase tracking-[0.1em] text-[#f4d9a8]">
            {eyebrow}
          </p>
          {/* Typewriter title. The full text is the accessible name; the
              animating characters + caret are hidden from assistive tech. A
              min-height reserves the two-line slot so nothing below jumps. */}
          <h1
            aria-label={title}
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
            {subtitle}
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
          <p className="mt-2.5 text-center font-mono text-meta tracking-[0.04em] text-muted">
            {photo ? `● ${t.signup.photoUploaded}` : t.signup.badgeEmpty}
          </p>

          {/* Name + surname */}
          <p className="mt-6 text-meta font-semibold uppercase tracking-[0.06em] text-muted">
            {t.signup.nameLabel}
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5">
            <Field
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.signup.firstName}
              maxLength={40}
            />
            <Field
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder={t.signup.surname}
              maxLength={40}
            />
          </div>

          {/* Home city */}
          <p className="mt-5 text-meta font-semibold uppercase tracking-[0.06em] text-muted">
            {t.signup.cityLabel}
          </p>
          <div className="mt-2.5">
            <CityPicker value={city} onChange={setCity} />
          </div>

          {/* Age */}
          <div className="mt-5 flex items-baseline justify-between">
            <p className="text-meta font-semibold uppercase tracking-[0.06em] text-muted">
              {t.signup.ageLabel}
            </p>
            {ageBracket && <p className="font-mono text-meta text-muted">{ageBracket(age)}</p>}
          </div>
          <div className="mt-2.5">
            <AgeStepper age={age} onChange={setAge} />
          </div>

          {/* Extra fields (e.g. organizer role picker) */}
          {extraFields}

          {/* Submit */}
          <Button
            variant="accent"
            size="lg"
            fullWidth
            type="button"
            onClick={submit}
            disabled={!valid}
            className="mt-6"
          >
            <span>{valid ? submitValid : submitInvalid}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M4 10h11M11 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>

          {consent && (
            <p className="mt-3.5 text-center text-caption leading-relaxed text-muted">
              {consent.before} <span className="font-semibold text-pine">{consent.link}</span>{' '}
              {consent.after}
            </p>
          )}
        </div>
      </div>

      {submitted &&
        city &&
        renderSuccess(
          { name: trimmedName, surname: trimmedSurname, city, age, photo, initials },
          () => setSubmitted(false),
        )}
    </div>
  )
}
