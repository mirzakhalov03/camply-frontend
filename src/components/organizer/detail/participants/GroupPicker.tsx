import { useTranslation } from '../../../../i18n/useTranslation'
import type { CampGroupDetail } from '../../../../api/services/campGroups.service'

type Props = {
  groups: CampGroupDetail[]
  /** Currently selected group, or null for "unassigned". */
  value: string | null
  onChange: (groupId: string | null) => void
  disabled?: boolean
}

/*
  Group selector — chips rather than a <select>, because groups carry a COLOR that
  is part of how organizers recognize them at a glance, and a native select can't
  render it. Shared by AddParticipantSheet (assign at add time) and
  ParticipantPeekSheet (reassign later), so both paths behave identically.

  "Unassigned" is always offered as a real choice: a participant can legitimately
  sit outside a group while the organizer is still sorting people.
*/
export function GroupPicker({ groups, value, onChange, disabled }: Props) {
  const { t } = useTranslation()
  const d = t.org.detail

  return (
    <div className="flex flex-col gap-2">
      <span className="text-meta font-bold uppercase tracking-wide text-muted">{d.group}</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(null)}
          aria-pressed={value === null}
          className={`rounded-full border px-3 py-1.5 text-caption font-semibold transition disabled:opacity-50 ${
            value === null
              ? 'border-pine bg-pine text-white'
              : 'border-line bg-surface text-muted hover:text-content'
          }`}
        >
          {d.unassigned}
        </button>

        {groups.map((g) => {
          const selected = value === g.id
          return (
            <button
              key={g.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(g.id)}
              aria-pressed={selected}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption font-semibold transition disabled:opacity-50 ${
                selected
                  ? 'border-content bg-soft text-content'
                  : 'border-line bg-surface text-muted hover:text-content'
              }`}
            >
              {/* The group's own color — runtime data, so an inline style is the
                  justified exception (Tailwind can't enumerate arbitrary values). */}
              <span
                className="h-2.5 w-2.5 flex-none rounded-full"
                style={{ backgroundColor: g.color }}
                aria-hidden
              />
              {g.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
