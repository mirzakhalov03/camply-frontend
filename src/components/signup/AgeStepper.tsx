import { useTranslation } from '../../i18n/useTranslation'

// Quick-pick shortcuts shown as chips under the stepper (from the design).
const AGE_CHIPS = [12, 14, 16, 18, 20, 22]
export const AGE_MIN = 7
export const AGE_MAX = 75

type Props = {
  age: number
  onChange: (age: number) => void
}

/*
  Age control: a big tap-friendly −/+ stepper (clamped to AGE_MIN…AGE_MAX) with
  a row of common-age chips for one-tap selection. The current age is echoed in a
  large tabular number so it stays legible while stepping. Pure controlled input
  — the parent owns `age`.
*/
export function AgeStepper({ age, onChange }: Props) {
  const { t } = useTranslation()

  const dec = () => onChange(Math.max(AGE_MIN, age - 1))
  const inc = () => onChange(Math.min(AGE_MAX, age + 1))

  return (
    <div className="rounded-[18px] border-[1.5px] border-[#e7e1d3] bg-[#fffdf8] p-4 pb-3.5 shadow-[0_3px_10px_rgba(20,40,30,0.04)]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={dec}
          aria-label={`${t.signup.ageLabel} −`}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-[#f1ede2] transition-colors active:bg-[#e5dfd0]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <rect x="3" y="8" width="12" height="2.4" rx="1.2" fill="#0f6b4f" />
          </svg>
        </button>

        <div className="text-center">
          <div className="font-display text-[44px] font-bold leading-[0.9] tracking-tight text-pine tabular-nums">
            {age}
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9aa79f]">
            {t.signup.ageUnit}
          </div>
        </div>

        <button
          type="button"
          onClick={inc}
          aria-label={`${t.signup.ageLabel} +`}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-pine shadow-[0_4px_12px_rgba(15,107,79,0.25)] transition-colors active:bg-deep"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M9 3v12M3 9h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mt-4 flex gap-[7px]">
        {AGE_CHIPS.map((value) => {
          const active = age === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              aria-pressed={active}
              className={[
                'h-[34px] flex-1 rounded-[11px] text-[13px] font-bold tabular-nums transition-colors',
                active
                  ? 'bg-pine text-white shadow-[0_4px_10px_rgba(15,107,79,0.22)]'
                  : 'bg-[#f1ede2] text-[#6c7a71]',
              ].join(' ')}
            >
              {value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
