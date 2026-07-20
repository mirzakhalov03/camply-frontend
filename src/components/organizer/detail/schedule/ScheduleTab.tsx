import { useState } from 'react'
import { Skeleton } from '@/components/ui'
import { useTranslation } from '@/i18n/useTranslation'
import { useSchedule, useDeleteActivity } from '@/api/queries/schedule.queries'
import { groupIntoDays, type Activity } from '@/api/services/schedule.service'
import { DaySelector } from '@/components/participant/schedule/DaySelector'
import { useCampDetail } from '../campDetailContext'
import { OrgActivityRow } from './OrgActivityRow'
import { ActivitySheet } from './ActivitySheet'

/*
  Schedule tab — the camp timeline the organizer authors, grouped by day. Reads the
  same schedule the participant sees (useSchedule); the activity sheet writes back to
  the shared cache. Loading/empty/error states per ReadyProduct §9.

  One sheet serves both create and edit: `editing` carries the activity being changed,
  or null for a new one. `sheetOpen` is tracked separately so closing animates out
  before `editing` clears — deriving open from `editing !== null` would make the edit
  form blank mid-animation.
*/
export function ScheduleTab() {
  const { camp } = useCampDetail()
  const { t } = useTranslation()
  const d = t.org.detail
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const { data, isPending, isError } = useSchedule(camp.id)
  const remove = useDeleteActivity(camp.id)

  const openCreate = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const openEdit = (activity: Activity) => {
    setEditing(activity)
    setSheetOpen(true)
  }

  /*
    window.confirm matches the destructive-action pattern already used for managers
    (ManagerRow) — deleting an activity is not undoable, so it must be deliberate.
  */
  const confirmDelete = (activity: Activity) => {
    if (!window.confirm(`${d.deleteActivity}\n\n${d.deleteActivityBody}`)) return
    remove.mutate(activity.id)
  }

  const days = data ? groupIntoDays(data) : []
  // Default selection: today if present, else the first day with activities.
  const activeKey = selectedKey ?? days.find((x) => x.isToday)?.key ?? days[0]?.key ?? ''
  const selectedDay = days.find((x) => x.key === activeKey)

  return (
    <div className="flex flex-col gap-4 pt-1">
      <button
        type="button"
        onClick={openCreate}
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
      ) : days.length === 0 ? (
        <p className="py-8 text-center text-body text-muted">{d.schedEmpty}</p>
      ) : (
        <>
          <DaySelector days={days} selectedKey={activeKey} onSelect={setSelectedKey} />
          {selectedDay ? (
            <div className="rounded-card border border-line bg-surface px-4 shadow-[0_3px_12px_rgba(20,40,30,0.04)]">
              {selectedDay.activities.map((a, i) => (
                <OrgActivityRow
                  key={a.id}
                  activity={a}
                  last={i === selectedDay.activities.length - 1}
                  onEdit={openEdit}
                  onDelete={confirmDelete}
                />
              ))}
            </div>
          ) : null}
        </>
      )}

      <ActivitySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        camp={camp}
        activity={editing}
      />
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
