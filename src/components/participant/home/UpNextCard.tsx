import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { clockTime } from '../../../lib/relativeTime'
import type { Activity } from '../../../api/services/schedule.service'

type Props = {
  /** The next relevant activity (from pickUpNext). */
  activity: Activity
  /** Jump to the full schedule. */
  onOpen: () => void
}

/*
  "Up next" — the single most useful thing on Home: what's happening now/next and
  where. Derived from the schedule domain (pickUpNext), so it can't drift from the
  timeline. Tapping anywhere opens the schedule. The time is split (09 / :30) to echo
  the prototype's chunky time chip. The group line shows only for group-scoped
  activities; camp-wide ones just show the location.
*/
export function UpNextCard({ activity, onOpen }: Props) {
  const { t } = useTranslation()
  const [hour, minute] = clockTime(activity.startsAt).split(':')
  const groupName = activity.scope.kind === 'group' ? activity.scope.groupName : null

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3.5 rounded-[20px] border border-line bg-surface p-4 text-left shadow-[0_4px_16px_rgba(20,40,30,0.06)] transition active:scale-[0.99]"
    >
      <div className="flex h-[52px] w-[52px] flex-none flex-col items-center justify-center rounded-[15px] bg-green-tint">
        <span className="text-title font-bold leading-none text-pine">{hour}</span>
        <span className="text-meta font-semibold text-pine/70">:{minute}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-meta font-semibold uppercase tracking-wide text-muted">
          {t.home.upNext}
        </div>
        <div className="mt-0.5 text-heading font-bold text-content">{activity.title}</div>
        <div className="mt-0.5 truncate text-caption text-muted">
          {groupName
            ? `${activity.location} · ${interpolate(t.home.upNextWith, { group: groupName })}`
            : activity.location}
        </div>
      </div>
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-soft">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-pine"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  )
}
