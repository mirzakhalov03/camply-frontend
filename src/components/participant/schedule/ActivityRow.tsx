import { useTranslation } from '../../../i18n/useTranslation'
import { clockTime } from '@/utils/relativeTime'
import { activityStatus, type Activity } from '../../../api/services/schedule.service'

type Props = {
  activity: Activity
  /** Last row in its list — drops the divider. */
  last?: boolean
}

/*
  One schedule row: time · status dot · title · location · status tag. SHARED by the
  home "Today's schedule" widget and the full schedule screen so they can never
  drift. The item happening NOW gets the pine tint, a pulsing ring, and a "Now" tag —
  the visual language the prototype uses to make "where am I supposed to be"
  answerable at a glance. Status is derived here (activityStatus), not stored.
*/
export function ActivityRow({ activity, last = false }: Props) {
  const { t } = useTranslation()
  const status = activityStatus(activity)
  const isNow = status === 'now'
  const border = last ? '' : 'border-b border-line'

  return (
    <div
      className={`flex gap-3.5 py-3.5 ${border} ${
        isNow ? '-mx-[18px] rounded-input bg-green-tint px-[18px]' : ''
      }`}
    >
      <div
        className={`w-[46px] flex-none font-mono text-body ${isNow ? 'text-pine' : 'text-muted'}`}
      >
        {clockTime(activity.startsAt)}
      </div>
      <span
        className={`mt-1.5 h-2 w-2 flex-none rounded-full ${
          isNow ? 'animate-now-ring bg-pine' : status === 'done' ? 'bg-pine/40' : 'bg-muted/40'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className={`text-body text-content ${isNow ? 'font-bold' : 'font-semibold'}`}>
          {activity.title}
        </div>
        <div className="truncate text-caption text-muted">{activity.location}</div>
      </div>
      {status === 'done' && (
        <span className="self-center text-meta font-semibold text-muted">{t.home.statusDone}</span>
      )}
      {isNow && (
        <span className="self-center text-meta font-bold text-amber">{t.home.statusNow}</span>
      )}
    </div>
  )
}
