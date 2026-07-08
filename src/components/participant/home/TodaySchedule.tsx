import { useTranslation } from '../../../i18n/useTranslation'
import type { Activity } from '../../../api/services/schedule.service'
import { ActivityRow } from '../schedule/ActivityRow'

type Props = {
  /** Today's activities, already sorted (from pickToday). */
  activities: Activity[]
  /** Open the full schedule. */
  onSeeAll: () => void
}

/*
  Compact "today" timeline on Home. Renders the SAME ActivityRow as the full
  schedule screen, so the two can never drift. Data comes from the schedule domain
  (useSchedule → pickToday) via HomeScreen — not from campHome anymore.
*/
export function TodaySchedule({ activities, onSeeAll }: Props) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-heading font-bold text-content">{t.home.todaySchedule}</h2>
        <button type="button" onClick={onSeeAll} className="text-body font-semibold text-pine">
          {t.home.seeAll}
        </button>
      </div>

      <div className="rounded-[20px] border border-line bg-surface px-[18px] shadow-[0_4px_16px_rgba(20,40,30,0.06)]">
        {activities.length > 0 ? (
          activities.map((act, i) => (
            <ActivityRow key={act.id} activity={act} last={i === activities.length - 1} />
          ))
        ) : (
          <p className="py-5 text-center text-caption text-muted">{t.schedule.emptyDay}</p>
        )}
      </div>
    </section>
  )
}
