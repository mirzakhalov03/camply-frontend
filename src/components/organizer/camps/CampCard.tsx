import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { OrganizerCamp } from '../../../api/services/camps.service'

/*
  One camp on the organizer dashboard. Whole card is the tap target → camp detail.
  The status pill sits on the cover; the check-in bar shows only for a running camp
  (an upcoming/draft camp has nobody to check in yet).
*/
export function CampCard({ camp, onOpen }: { camp: OrganizerCamp; onOpen: () => void }) {
  const { t } = useTranslation()
  const c = t.org.camps
  const statusLabel = {
    active: c.statusActive,
    upcoming: c.statusUpcoming,
    draft: c.statusDraft,
    archived: c.statusArchived,
  }[camp.status]

  return (
    <button
      type="button"
      onClick={onOpen}
      className="overflow-hidden rounded-card border border-line bg-surface text-left shadow-[0_5px_18px_rgba(20,40,30,0.06)] transition active:scale-[0.99]"
    >
      {/* Decorative cover — gradient uses brand tokens; same in light/dark. */}
      <div className="relative h-24 bg-gradient-to-br from-pine to-pine-light">
        {camp.coverImage ? (
          <img src={camp.coverImage} alt="" className="h-full w-full object-cover" />
        ) : null}
        <span className="absolute left-3.5 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-meta font-bold text-content">
          <span
            className={`h-1.5 w-1.5 rounded-full ${camp.status === 'active' ? 'bg-pine' : 'bg-muted'}`}
          />
          {statusLabel}
        </span>
      </div>

      <div className="p-4">
        <div className="text-heading font-bold text-content">{camp.name}</div>
        <div className="mt-0.5 text-caption text-muted">
          📍 {camp.location} · {camp.dateRange}
        </div>

        <div className="mt-3 flex gap-4">
          <Stat value={camp.participantCount} unit={c.participantsUnit} />
          <Stat value={camp.groupCount} unit={c.groupsUnit} />
        </div>

        {camp.status === 'active' && camp.dayTotal > 0 ? (
          <div className="mt-3">
            <div className="mb-1.5 flex justify-between text-meta text-muted">
              <span>{c.checkIn}</span>
              <span className="font-semibold text-pine">{camp.checkinPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-pine"
                style={{ width: `${camp.checkinPct}%` }}
              />
            </div>
            <div className="mt-2 text-meta text-muted">
              {interpolate(c.dayProgress, { current: camp.dayCurrent, total: camp.dayTotal })}
            </div>
          </div>
        ) : null}
      </div>
    </button>
  )
}

function Stat({ value, unit }: { value: number; unit: string }) {
  return (
    <div>
      <span className="text-heading font-bold text-content">{value}</span>{' '}
      <span className="text-meta text-muted">{unit}</span>
    </div>
  )
}
