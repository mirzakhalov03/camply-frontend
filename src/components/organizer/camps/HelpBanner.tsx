import { Avatar } from '../../ui'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { relativeTime } from '../../../lib/relativeTime'
import type { HelpReason, HelpRequest } from '../../../api/services/helpRequests.service'

/*
  Live SOS banner — the loudest thing on the dashboard when a participant needs
  help (safety is sacred). Danger-tinted, names who + why + where, and "View"
  jumps the organizer to the map to locate them. Resolving happens on the map /
  profile (later slice); here it's a fast path to act.
*/
const REASON_ICON: Record<HelpReason, string> = {
  medical: '🩹',
  lost: '🧭',
  unsafe: '⚠️',
  other: '🆘',
}

export function HelpBanner({ help, onView }: { help: HelpRequest; onView: () => void }) {
  const { t } = useTranslation()
  const c = t.org.camps
  const reasonLabel = {
    medical: c.reasonMedical,
    lost: c.reasonLost,
    unsafe: c.reasonUnsafe,
    other: c.reasonOther,
  }[help.reason]

  return (
    <div className="flex items-center gap-3 rounded-card border border-danger/30 bg-danger-tint p-3.5">
      <Avatar
        name={help.participantName}
        initials={help.initials}
        color={help.avatarColor}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-title font-bold text-danger-deep">
            {interpolate(c.needsHelp, { name: help.participantName })}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2 py-0.5 text-[10px] font-extrabold text-white">
            {REASON_ICON[help.reason]} {reasonLabel}
          </span>
        </div>
        <div className="mt-0.5 truncate text-caption text-muted">
          {help.zone} · {relativeTime(help.createdAt, t.time)} · {c.tapToLocate}
        </div>
      </div>
      <button
        type="button"
        onClick={onView}
        className="flex-none rounded-full border border-danger/25 bg-surface px-3.5 py-2 text-caption font-bold text-danger-deep active:scale-95"
      >
        {c.view}
      </button>
    </div>
  )
}
