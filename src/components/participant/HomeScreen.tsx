import { useCampHome } from '../../lib/campHome'
import { CampCover } from './home/CampCover'
import { UpNextCard } from './home/UpNextCard'
import { TodaySchedule } from './home/TodaySchedule'
import { AnnouncementCard } from './home/AnnouncementCard'
import { MyGroupCard } from './home/MyGroupCard'
import { HomeSkeleton } from './HomeSkeleton'

type Props = {
  /** Secondary destinations that aren't bottom-nav tabs (schedule, announcements). */
  onOpenSchedule: () => void
  onOpenAnnouncements: () => void
  /** Group card → the Chat tab. */
  onOpenGroup: () => void
}

/*
  Participant Home. It OWNS the data (useCampHome) and hands slices to each card
  as props — the cards are presentational and don't know the data is mock. When
  the organizer's backend lands, only fetchCampHome() changes; this file and the
  cards stay exactly as they are. While loading, a skeleton keeps the layout from
  jumping; on error we degrade gracefully rather than crash.
*/
export function HomeScreen({ onOpenSchedule, onOpenAnnouncements, onOpenGroup }: Props) {
  const { data, isPending, isError } = useCampHome()

  if (isPending || isError || !data) {
    return <HomeSkeleton />
  }

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <CampCover camp={data.camp} onOpenNotifications={onOpenAnnouncements} />

      <div className="flex flex-col gap-3.5 px-[18px] pb-6 pt-4">
        <div className="animate-rise-in" style={{ animationDelay: '40ms' }}>
          <UpNextCard upNext={data.upNext} onOpen={onOpenSchedule} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '110ms' }}>
          <TodaySchedule schedule={data.schedule} onSeeAll={onOpenSchedule} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '180ms' }}>
          <AnnouncementCard announcement={data.announcement} onSeeAll={onOpenAnnouncements} />
        </div>
        <div className="animate-rise-in" style={{ animationDelay: '250ms' }}>
          <MyGroupCard group={data.group} onOpen={onOpenGroup} />
        </div>
      </div>
    </div>
  )
}
