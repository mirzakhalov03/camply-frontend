import { useTranslation } from '@/i18n/useTranslation'
import { clockTime } from '@/utils/relativeTime'
import type { Activity } from '@/api/services/schedule.service'

/*
  One activity in the organizer's schedule list: start time · title · location, with
  the audience (All camp / group name) on the right. Simpler than the participant
  ActivityRow — the organizer view is a plan, not a live "where am I now" tracker.

  The row body is a button that opens the edit sheet; delete sits beside it as its
  own button rather than nested inside — nested buttons are invalid markup, and the
  destructive action deserves a separate hit target so an edit tap can't land on it.
*/
export function OrgActivityRow({
  activity,
  last = false,
  onEdit,
  onDelete,
}: {
  activity: Activity
  last?: boolean
  onEdit: (activity: Activity) => void
  onDelete: (activity: Activity) => void
}) {
  const { t } = useTranslation()
  const d = t.org.detail
  const isGroup = activity.scope.kind === 'group'

  return (
    <div className={`flex items-center gap-2 py-3 ${last ? '' : 'border-b border-line'}`}>
      <button
        type="button"
        onClick={() => onEdit(activity)}
        aria-label={`${d.editActivity}: ${activity.title}`}
        className="flex min-w-0 flex-1 items-center gap-3.5 rounded-input text-left transition active:scale-[0.99]"
      >
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
      </button>

      <button
        type="button"
        onClick={() => onDelete(activity)}
        aria-label={`${d.delete}: ${activity.title}`}
        className="flex-none rounded-input p-2 text-muted transition hover:text-danger active:scale-95"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  )
}
