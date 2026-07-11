import { useTranslation } from '../../../../i18n/useTranslation'
import { clockTime } from '../../../../lib/relativeTime'
import type { Activity } from '../../../../api/services/schedule.service'

/*
  One activity in the organizer's schedule list: start time · title · location, with
  the audience (All camp / group name) on the right. Simpler than the participant
  ActivityRow — the organizer view is a plan, not a live "where am I now" tracker.
*/
export function OrgActivityRow({ activity, last = false }: { activity: Activity; last?: boolean }) {
  const { t } = useTranslation()
  const isGroup = activity.scope.kind === 'group'

  return (
    <div className={`flex items-center gap-3.5 py-3 ${last ? '' : 'border-b border-line'}`}>
      <div className="w-[46px] flex-none font-mono text-body text-pine">
        {clockTime(activity.startsAt)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-body font-semibold text-content">{activity.title}</div>
        <div className="truncate text-caption text-muted">{activity.location}</div>
      </div>
      <span
        className={`flex-none rounded-full px-2.5 py-1 text-meta font-semibold ${
          isGroup ? 'bg-soft text-muted' : 'bg-green-tint text-pine'
        }`}
      >
        {activity.scope.kind === 'group' ? activity.scope.groupName : t.announcements.allCamp}
      </span>
    </div>
  )
}
