import { useRef, useEffect } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import type { ScheduleDay } from '../../../api/services/schedule.service'

type Props = {
  days: ScheduleDay[]
  selectedKey: string
  onSelect: (key: string) => void
}

/*
  Horizontal day-chip strip. One chip per day that has activities. Today is
  highlighted (pine) and labeled "Today"; past days are dimmed but tappable. The
  selected chip auto-scrolls into view so today is visible on open even when it sits
  mid-camp. Weekday/day labels come from the i18n `time` namespace (NOT Intl, whose
  uz data is incomplete — the same reason months are owned in translations.ts).
*/
export function DaySelector({ days, selectedKey, onSelect }: Props) {
  const { t } = useTranslation()
  const stripRef = useRef<HTMLDivElement>(null)

  // Center the selected chip on mount / when selection changes.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLButtonElement>(`[data-key="${selectedKey}"]`)
    el?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [selectedKey])

  return (
    <div
      ref={stripRef}
      className="flex gap-2 overflow-x-auto px-[18px] pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {days.map((day) => {
        const selected = day.key === selectedKey
        const top = day.isToday ? t.schedule.today : t.time.weekdaysShort[day.date.getDay()]
        return (
          <button
            key={day.key}
            type="button"
            data-key={day.key}
            onClick={() => onSelect(day.key)}
            aria-pressed={selected}
            className={`flex min-w-[52px] flex-none flex-col items-center rounded-input px-3 py-2 transition ${
              selected
                ? 'bg-pine text-white'
                : 'border border-line bg-surface text-muted active:scale-[0.97]'
            }`}
          >
            <span className="text-meta font-semibold uppercase tracking-wide">{top}</span>
            <span className={`text-heading font-bold ${selected ? 'text-white' : 'text-content'}`}>
              {day.date.getDate()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
