import { Avatar } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import type { RosterParticipant } from '../../../../api/services/roster.service'

/*
  One participant in the roster: avatar, name, group · city, and a small check-in
  dot (pine = on-site, muted = out-of-bounds — no words, per design). The whole row
  is a button that opens the participant peek sheet; the chevron signals that.
*/
export function RosterRow({
  p,
  onSelect,
}: {
  p: RosterParticipant
  onSelect: (p: RosterParticipant) => void
}) {
  const { t } = useTranslation()
  const isIn = p.status === 'in'

  return (
    <button
      type="button"
      onClick={() => onSelect(p)}
      className="flex w-full items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-2.5 text-left transition active:scale-[0.99]"
    >
      <Avatar name={p.name} initials={p.initials} color={p.avatarColor} photo={p.photo} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-title font-semibold text-content">{p.name}</div>
        <div className="truncate text-caption text-muted">
          {(p.groupName ?? t.org.detail.unassigned) + ' · ' + p.city}
        </div>
      </div>
      {/* Check-in status as a dot — the glance without the "In"/"Out" words. */}
      <span
        className={`h-2 w-2 flex-none rounded-full ${isIn ? 'bg-pine' : 'bg-muted/40'}`}
        aria-hidden
      />
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-none text-muted"
        aria-hidden
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}
