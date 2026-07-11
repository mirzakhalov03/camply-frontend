import { ORGANIZER_ROLES, ROLE_EMOJI, type OrganizerRole } from './roles'

/*
  Single-select role chips for the organizer profile. The seven role keys live in
  ./roles; the visible labels come from i18n. Chips wrap onto multiple rows on
  narrow screens. Controlled input — the parent owns `value`.
*/

type Props = {
  value: OrganizerRole | null
  onChange: (role: OrganizerRole) => void
  /** Human labels for each role key, in the active language. */
  labels: Record<OrganizerRole, string>
}

export function RolePicker({ value, onChange, labels }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORGANIZER_ROLES.map((role) => {
        const active = value === role
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            aria-pressed={active}
            className={[
              'rounded-full px-4 py-2.5 text-[13.5px] font-semibold transition-all',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
              active
                ? 'bg-pine text-white shadow-[0_4px_12px_rgba(15,107,79,0.24)]'
                : 'border-[1.5px] border-[#e7e1d3] bg-[#fffdf8] text-[#6c7a71] active:bg-[#f1ede2]',
            ].join(' ')}
          >
            <span aria-hidden className="mr-1.5">
              {ROLE_EMOJI[role]}
            </span>
            {labels[role]}
          </button>
        )
      })}
    </div>
  )
}
