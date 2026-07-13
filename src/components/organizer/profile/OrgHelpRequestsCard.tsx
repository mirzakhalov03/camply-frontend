import { Avatar } from '../../ui'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { relativeTime } from '@/utils/relativeTime'
import {
  useActiveHelpRequests,
  useResolveHelpRequest,
} from '../../../api/queries/helpRequests.queries'
import type { HelpReason } from '../../../api/services/helpRequests.service'

/*
  Incoming SOS / help requests on the organizer profile. Reads the SAME
  organizerKeys.helpRequests the dashboard banner reads, and resolving here writes
  through the shared resolve mutation — so the dashboard banner disappears the moment
  a request is resolved from here. Safety is sacred: this is always visible, and idle
  reads as a reassuring "all safe."
*/
const REASON_ICON: Record<HelpReason, string> = {
  medical: '🩹',
  lost: '🧭',
  unsafe: '⚠️',
  other: '🆘',
}

export function OrgHelpRequestsCard() {
  const { t } = useTranslation()
  const p = t.org.profile
  const c = t.org.camps
  const { data } = useActiveHelpRequests()
  const resolve = useResolveHelpRequest()
  const active = data ?? []

  const reasonLabel = (r: HelpReason) =>
    ({
      medical: c.reasonMedical,
      lost: c.reasonLost,
      unsafe: c.reasonUnsafe,
      other: c.reasonOther,
    })[r]

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
      <div className="mb-2.5 text-body font-bold text-content">{p.helpRequests}</div>

      {active.length === 0 ? (
        <div className="flex items-center gap-2.5 py-1 text-body text-muted">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-green-tint text-base">
            ✓
          </span>
          {p.allSafe}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {active.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-3 rounded-input border border-danger/30 bg-danger-tint p-3"
            >
              <Avatar
                name={h.participantName}
                initials={h.initials}
                color={h.avatarColor}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-title font-bold text-danger-deep">
                    {interpolate(c.needsHelp, { name: h.participantName })}
                  </span>
                  <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-extrabold text-white">
                    {REASON_ICON[h.reason]} {reasonLabel(h.reason)}
                  </span>
                </div>
                <div className="truncate text-caption text-muted">
                  {h.zone} · {relativeTime(h.createdAt, t.time)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => resolve.mutate(h.id)}
                disabled={resolve.isPending}
                className="flex-none rounded-full bg-pine px-3.5 py-2 text-caption font-bold text-white active:scale-95 disabled:opacity-50"
              >
                {p.resolve}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
