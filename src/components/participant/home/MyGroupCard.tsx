import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import type { CampHome } from '../../../lib/campHome'

type Props = {
  group: CampHome['group']
  /** Open the group / chat. */
  onOpen: () => void
}

/*
  "My group" shortcut → the group's chat. Overlapping avatars give it a social,
  tap-me feel. Avatar colors are runtime data, so they're inline styles (one of
  the few justified cases — Tailwind can't enumerate arbitrary hex per member).
*/
export function MyGroupCard({ group, onOpen }: Props) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center gap-3.5 rounded-[20px] border border-line bg-surface p-4 text-left shadow-[0_4px_16px_rgba(20,40,30,0.06)] transition active:scale-[0.99]"
    >
      <div className="flex">
        {group.members.map((m, i) => (
          <span
            key={m.initials}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-[2.5px] border-surface text-[13px] font-bold text-white ${
              i > 0 ? '-ml-3.5' : ''
            }`}
            style={{ backgroundColor: m.color }}
          >
            {m.initials}
          </span>
        ))}
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t.home.myGroup}
        </div>
        <div className="text-base font-bold text-content">
          {group.name} · {interpolate(t.home.membersCount, { count: group.memberCount })}
        </div>
      </div>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  )
}
