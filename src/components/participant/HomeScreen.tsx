import { useCampHome } from '../../lib/campHome'
import { useAnnouncements } from '../../api/queries/announcements.queries'
import { useSchedule } from '../../api/queries/schedule.queries'
import { pickTodayWindow, pickUpNext } from '../../api/services/schedule.service'
import { useUnreadCount } from '../../store/useAnnouncementReads'
import { CampCover } from './home/CampCover'
import { UpNextCard } from './home/UpNextCard'
import { TodaySchedule } from './home/TodaySchedule'
import { AnnouncementCard } from './home/AnnouncementCard'
import { MyGroupCard } from './home/MyGroupCard'
import { HomeSkeleton } from './HomeSkeleton'
import { useCamp } from './campContext'

/*
  Participant Home. It OWNS the data and hands slices to each card as props — the
  cards are presentational. Camp/group come from useCampHome; the timeline comes from
  the schedule domain (useSchedule), and Home derives today's list + up-next from it
  (pickToday / pickUpNext) — one source of truth shared with the full schedule
  screen. While loading, a skeleton keeps the layout from jumping; on error we
  degrade gracefully. Navigation comes from the shell context (routes), not props.
*/
export function HomeScreen() {
  const { campId, goSchedule, goAnnouncements, goChat } = useCamp()
  const { data, isPending, isError } = useCampHome(campId)
  const { data: schedule, isPending: schedulePending } = useSchedule(campId)
  const { data: announcements } = useAnnouncements(campId)
  const latest = announcements?.[0]
  const unread = useUnreadCount((announcements ?? []).map((a) => a.id))

  // Wait for BOTH the camp payload and the schedule before revealing Home — the
  // schedule feeds two primary cards (Today's schedule + Up next). Without this,
  // if the schedule query resolves after campHome, those cards would briefly show
  // their empty state ("no activities") before the data pops in. A schedule *error*
  // (not pending) still lets Home render and degrades to an empty timeline.
  if (isPending || schedulePending || isError || !data) {
    return <HomeSkeleton />
  }

  const todayActivities = pickTodayWindow(schedule ?? [])
  const upNext = pickUpNext(schedule ?? [])

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <CampCover camp={data.camp} onOpenNotifications={goAnnouncements} unreadCount={unread} />

      <div className="flex flex-col gap-3.5 px-[18px] pb-6 pt-4">
        {upNext && (
          <div className="animate-rise-in" style={{ animationDelay: '40ms' }}>
            <UpNextCard activity={upNext} onOpen={goSchedule} />
          </div>
        )}
        <div className="animate-rise-in" style={{ animationDelay: '110ms' }}>
          <TodaySchedule activities={todayActivities} onSeeAll={goSchedule} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '180ms' }}>
          <AnnouncementCard latest={latest} unreadCount={unread} onSeeAll={goAnnouncements} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '250ms' }}>
          <MyGroupCard group={data.group} onOpen={goChat} />
        </div>
      </div>
    </div>
  )
}
