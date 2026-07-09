import { Avatar } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import type { RosterParticipant } from '../../../../api/services/roster.service'

/*
  One participant in the roster: avatar, name, group · city, and a check-in pill
  (In = on-site pine, Out = out-of-bounds muted). Whole row is a button so it can
  open a participant profile in a later slice.
*/
export function RosterRow({ p }: { p: RosterParticipant }) {
  const { t } = useTranslation()
  const d = t.org.detail
  const isIn = p.status === 'in'

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-2.5 text-left transition active:scale-[0.99]"
    >
      <Avatar name={p.name} initials={p.initials} color={p.avatarColor} photo={p.photo} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-title font-semibold text-content">{p.name}</div>
        <div className="truncate text-caption text-muted">
          {(p.groupName ?? d.unassigned) + ' · ' + p.city}
        </div>
      </div>
      <span
        className={`flex-none rounded-full px-2.5 py-1 text-meta font-bold ${
          isIn ? 'bg-green-tint text-pine' : 'bg-soft text-muted'
        }`}
      >
        {isIn ? d.statusIn : d.statusOut}
      </span>
    </button>
  )
}
