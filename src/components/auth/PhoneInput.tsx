import { useId, useState } from 'react'
import { PHONE_LENGTH, formatUzPhone, toPhoneDigits } from '../../lib/phone'

/* Brand-controlled Uzbek flag — replaces the OS emoji so it renders identically
   on every device. Simplified bands + crescent; decorative, so aria-hidden. */
function FlagUz() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10"
    >
      <svg viewBox="0 0 24 18" className="h-full w-full">
        <rect width="24" height="18" fill="#0099b5" />
        <rect y="6" width="24" height="12" fill="#fff" />
        <rect y="12" width="24" height="6" fill="#1eb53a" />
        <rect y="5.4" width="24" height="0.7" fill="#ce1126" />
        <rect y="11.9" width="24" height="0.7" fill="#ce1126" />
        <circle cx="4.2" cy="3" r="1.9" fill="#fff" />
        <circle cx="5.1" cy="3" r="1.9" fill="#0099b5" />
      </svg>
    </span>
  )
}

type Props = {
  /** Raw digits (no prefix, no separators). */
  value: string
  onChange: (digits: string) => void
  label: string
  error: string
}

/*
  Phone field with a locked +998 prefix. The participant types digits only; we
  strip anything non-numeric, cap at 9, and display the 90 123-45-67 mask. The
  error only shows after the field has been touched and left incomplete, so it
  never scolds someone mid-type.
*/
export function PhoneInput({ value, onChange, label, error }: Props) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const [touched, setTouched] = useState(false)

  const isComplete = value.length === PHONE_LENGTH
  const showError = touched && value.length > 0 && !isComplete

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink/70">
        {label}
      </label>

      <div
        className={[
          'flex items-center gap-2 rounded-2xl border bg-white px-3.5 py-3 transition-colors',
          'focus-within:border-pine focus-within:ring-2 focus-within:ring-amber/40',
          showError ? 'border-red-400' : 'border-ink/15',
        ].join(' ')}
      >
        <span className="flex items-center gap-1.5 font-mono text-base font-medium text-ink/80">
          <FlagUz />
          +998
        </span>
        <span aria-hidden className="h-5 w-px bg-ink/10" />
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="90 123-45-67"
          value={formatUzPhone(value)}
          onChange={(e) => onChange(toPhoneDigits(e.target.value))}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          className="w-full bg-transparent font-mono text-base tracking-wide text-ink placeholder:text-ink/30 focus:outline-none"
        />
      </div>

      {/* Reserves a line so the layout doesn't jump when the error appears. */}
      <p id={errorId} className="min-h-4 text-xs text-red-500">
        {showError ? error : ''}
      </p>
    </div>
  )
}
