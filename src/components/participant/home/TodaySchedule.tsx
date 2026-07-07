import { useTranslation } from '../../../i18n/useTranslation'
import type { ScheduleItem } from '../../../lib/campHome'

type Props = {
  schedule: ScheduleItem[]
  /** Open the full schedule. */
  onSeeAll: () => void
}

/*
  Compact "today" timeline. Each row shows time · a status dot · the activity.
  The item happening *now* gets the pine tint, a pulsing ring, and a "Now" tag —
  the same visual language the prototype uses to make "where am I supposed to be"
  answerable at a glance.
*/
export function TodaySchedule({ schedule, onSeeAll }: Props) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-content">{t.home.todaySchedule}</h2>
        <button type="button" onClick={onSeeAll} className="text-[13px] font-semibold text-pine">
          {t.home.seeAll}
        </button>
      </div>

      <div className="rounded-[20px] border border-line bg-surface px-[18px] shadow-[0_4px_16px_rgba(20,40,30,0.06)]">
        {schedule.map((item, i) => (
          <ScheduleRow
            key={item.time}
            item={item}
            last={i === schedule.length - 1}
            nowLabel={t.home.statusNow}
            doneLabel={t.home.statusDone}
          />
        ))}
      </div>
    </section>
  )
}

function ScheduleRow({
  item,
  last,
  nowLabel,
  doneLabel,
}: {
  item: ScheduleItem
  last: boolean
  nowLabel: string
  doneLabel: string
}) {
  const isNow = item.status === 'now'
  const border = last ? '' : 'border-b border-line'

  return (
    <div
      className={`flex gap-3.5 py-3.5 ${border} ${isNow ? '-mx-[18px] rounded-[14px] bg-green-tint px-[18px]' : ''}`}
    >
      <div
        className={`w-[46px] flex-none font-mono text-[13px] ${isNow ? 'text-pine' : 'text-muted'}`}
      >
        {item.time}
      </div>
      <span
        className={`mt-1.5 h-2 w-2 flex-none rounded-full ${
          isNow ? 'animate-now-ring bg-pine' : 'bg-[#cfd8d1]'
        }`}
      />
      <div className="flex-1">
        <div className={`text-sm text-content ${isNow ? 'font-bold' : 'font-semibold'}`}>
          {item.title}
        </div>
        <div className="text-xs text-muted">{item.location}</div>
      </div>
      {item.status === 'done' && (
        <span className="self-center text-[11px] font-semibold text-[#3f8a6e]">{doneLabel}</span>
      )}
      {isNow && <span className="self-center text-[11px] font-bold text-amber">{nowLabel}</span>}
    </div>
  )
}
