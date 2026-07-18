import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { useCamp } from '../campContext'
import { useSchedule } from '../../../api/queries/schedule.queries'
import { groupIntoDays } from '../../../api/services/schedule.service'
import { ActivityRow } from './ActivityRow'
import { DaySelector } from './DaySelector'
import { ScheduleSkeleton } from './ScheduleSkeleton'

/*
  The full schedule — reachable from the home "Today's schedule" widget's See all,
  and a real route (/camp/schedule) so schedule push notifications can deep-link.
  Structure mirrors AnnouncementsScreen: back header + content, with loading / error /
  empty states. Days come from groupIntoDays(); the day strip selects one day's
  timeline. "Now" is computed at render (activityStatus) — good enough for a screen
  you open; a 1-minute ticker is a deliberate future refinement.
*/
export function ScheduleScreen() {
  const { t, lang } = useTranslation()
  const navigate = useNavigate()
  const { campId } = useCamp()
  const { data, isPending, isError } = useSchedule(campId)

  const days = useMemo(() => groupIntoDays(data ?? []), [data])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Default to today's day (or the first day) once data arrives.
  useEffect(() => {
    if (selectedKey || days.length === 0) return
    const today = days.find((d) => d.isToday)
    setSelectedKey((today ?? days[0]).key)
  }, [days, selectedKey])

  const selectedDay = days.find((d) => d.key === selectedKey) ?? null

  // Header subtitle: the selected day's full date, e.g. "Wed, 9 Jul".
  const subtitle = selectedDay
    ? `${t.time.weekdaysShort[selectedDay.date.getDay()]}, ${selectedDay.date.getDate()} ${
        t.time.months[selectedDay.date.getMonth()]
      }`
    : ''

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex flex-none items-center gap-3 px-5 pb-2 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t.schedule.back}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-content"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-content">
            {t.schedule.title}
          </h1>
          {subtitle && (
            <p className="text-caption text-muted" lang={lang}>
              {subtitle}
            </p>
          )}
        </div>
      </header>

      {isPending ? (
        <ScheduleSkeleton />
      ) : isError ? (
        <div className="flex flex-1 items-center justify-center px-8 text-center text-body text-muted">
          {t.schedule.error}
        </div>
      ) : days.length === 0 ? (
        <EmptyState title={t.schedule.empty} />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-none pt-1">
            <DaySelector days={days} selectedKey={selectedKey ?? ''} onSelect={setSelectedKey} />
          </div>
          <div className="flex-1 overflow-y-auto px-[18px] pb-8 pt-3">
            {selectedDay && selectedDay.activities.length > 0 ? (
              <div className="rounded-card border border-line bg-surface px-[18px] shadow-[0_4px_16px_rgba(20,40,30,0.06)]">
                {selectedDay.activities.map((act, i) => (
                  <ActivityRow
                    key={act.id}
                    activity={act}
                    last={i === selectedDay.activities.length - 1}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title={t.schedule.emptyDay} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-card bg-green-tint text-3xl">
        🗓️
      </div>
      <p className="text-body text-muted">{title}</p>
    </div>
  )
}
