import { Avatar } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { formatStoredPhone } from '@/utils/phone'
import type { RosterParticipant } from '../../../../api/services/roster.service'

/*
  One participant in the roster: avatar, name, group · city, and phone. The whole
  row is a button that opens the participant peek sheet; the chevron signals that.

  The phone gets its own line in tabular numerals so digits align down the column —
  organizers scan this list looking for a specific number, and ragged proportional
  digits make that materially harder. It's display-only here: the row is already a
  <button>, so a nested tel: link would be invalid markup. Calling lives in the peek
  sheet, one tap away.
*/
export function RosterRow({
  p,
  onSelect,
}: {
  p: RosterParticipant
  onSelect: (p: RosterParticipant) => void
}) {
  const { t } = useTranslation()

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
        {p.phone && (
          <div className="truncate text-meta tabular-nums text-muted">
            {formatStoredPhone(p.phone)}
          </div>
        )}
      </div>
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
