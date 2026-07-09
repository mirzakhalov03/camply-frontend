import { useState } from 'react'
import { Skeleton } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { dayBucketLabel } from '../../../../lib/relativeTime'
import { useSchedule } from '../../../../api/queries/schedule.queries'
import { groupIntoDays } from '../../../../api/services/schedule.service'
import { useCampDetail } from '../campDetailContext'
import { OrgActivityRow } from './OrgActivityRow'
import { AddActivitySheet } from './AddActivitySheet'

/*
  Schedule tab — the camp timeline the organizer authors, grouped by day. Reads the
  same schedule the participant sees (useSchedule); "Add activity" opens a sheet that
  writes back to the shared cache. Loading/empty/error states per ReadyProduct §9.
*/
export function ScheduleTab() {
  const { camp } = useCampDetail()
  const { t } = useTranslation()
  const d = t.org.detail
  const [addOpen, setAddOpen] = useState(false)
  const { data, isPending, isError } = useSchedule(camp.id)

  const dayLabels = { today: t.announcements.today, yesterday: t.announcements.yesterday }

  return (
    <div className="flex flex-col gap-4 pt-1">
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="flex items-center justify-center gap-2 rounded-input bg-pine py-3 text-body font-bold text-white shadow-[0_6px_16px_rgba(15,107,79,0.22)] active:scale-[0.99]"
      >
        <PlusIcon />
        {d.addActivity}
      </button>

      {isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40" tone="surface" />
          <Skeleton className="h-28" tone="surface" />
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-body text-muted">{d.loadError}</p>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-body text-muted">{d.schedEmpty}</p>
      ) : (
        groupIntoDays(data).map((day) => (
          <section key={day.key}>
            <h3 className="mb-2 text-meta font-bold uppercase tracking-wider text-muted">
              {dayBucketLabel(day.date.toISOString(), t.time, dayLabels)}
            </h3>
            <div className="rounded-card border border-line bg-surface px-4 shadow-[0_3px_12px_rgba(20,40,30,0.04)]">
              {day.activities.map((a, i) => (
                <OrgActivityRow key={a.id} activity={a} last={i === day.activities.length - 1} />
              ))}
            </div>
          </section>
        ))
      )}

      <AddActivitySheet open={addOpen} onClose={() => setAddOpen(false)} campId={camp.id} />
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
