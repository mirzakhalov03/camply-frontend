import { useCampHome } from '../../lib/campHome'
import { useAnnouncements } from '../../api/queries/announcements.queries'
import { useUnreadCount } from '../../store/useAnnouncementReads'
import { CampCover } from './home/CampCover'
import { UpNextCard } from './home/UpNextCard'
import { TodaySchedule } from './home/TodaySchedule'
import { AnnouncementCard } from './home/AnnouncementCard'
import { MyGroupCard } from './home/MyGroupCard'
import { HomeSkeleton } from './HomeSkeleton'
import { useCamp } from './campContext'

/*
  Participant Home. It OWNS the data (useCampHome) and hands slices to each card
  as props — the cards are presentational and don't know the data is mock. When
  the organizer's backend lands, only fetchCampHome() changes; this file and the
  cards stay exactly as they are. While loading, a skeleton keeps the layout from
  jumping; on error we degrade gracefully rather than crash. Navigation comes from
  the shell context (routes), not props.
*/
export function HomeScreen() {
  const { goSchedule, goAnnouncements, goChat } = useCamp()
  const { data, isPending, isError } = useCampHome()
  const { data: announcements } = useAnnouncements()
  const latest = announcements?.[0]
  const unread = useUnreadCount((announcements ?? []).map((a) => a.id))

  if (isPending || isError || !data) {
    return <HomeSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <CampCover camp={data.camp} onOpenNotifications={goAnnouncements} unreadCount={unread} />

      <div className="flex flex-col gap-3.5 px-[18px] pb-6 pt-4">
        <div className="animate-rise-in" style={{ animationDelay: '40ms' }}>
          <UpNextCard upNext={data.upNext} onOpen={goSchedule} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '110ms' }}>
          <TodaySchedule schedule={data.schedule} onSeeAll={goSchedule} />
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
