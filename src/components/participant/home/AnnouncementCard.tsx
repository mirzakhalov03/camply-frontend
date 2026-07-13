import { useTranslation } from '../../../i18n/useTranslation'
import { relativeTime } from '@/utils/relativeTime'
import { Badge } from '../../ui'
import type { Announcement } from '../../../api/services/announcements.service'

type Props = {
  /** Most important announcement to preview (feed is pinned-first, so [0]). */
  latest: Announcement | undefined
  /** Unread count, shown next to the header. */
  unreadCount: number
  /** Open the full announcements list. */
  onSeeAll: () => void
}

/*
  Home's announcement teaser. Shows the single most important announcement on the
  amber notice tint, plus an unread count by the header. Reads nothing itself —
  HomeScreen owns the feed query and hands the slice down, so Home and
  /camp/announcements share ONE source of truth (no drift).
*/
export function AnnouncementCard({ latest, unreadCount, onSeeAll }: Props) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-heading font-bold text-content">{t.home.latestAnnouncement}</h2>
          {unreadCount > 0 && (
            <Badge tone="pine" solid>
              {unreadCount}
            </Badge>
          )}
        </div>
        <button type="button" onClick={onSeeAll} className="text-body font-semibold text-pine">
          {t.home.all}
        </button>
      </div>

      {latest ? (
        <button
          type="button"
          onClick={onSeeAll}
          className="rounded-[20px] border border-amber/25 bg-amber-tint p-4 text-left"
        >
          <div className="mb-1.5 flex items-center gap-2">
            {latest.pinned && (
              <span className="text-meta font-bold text-amber">📌 {t.announcements.pinned}</span>
            )}
            <span className="text-meta text-muted">{relativeTime(latest.createdAt, t.time)}</span>
          </div>
          <p className="line-clamp-2 text-body font-semibold leading-snug text-content">
            {latest.body}
          </p>
          <p className="mt-2 text-caption text-muted">— {latest.author.name}</p>
        </button>
      ) : (
        <div className="rounded-[20px] border border-line bg-surface p-4 text-caption text-muted">
          {t.announcements.empty}
        </div>
      )}
    </section>
  )
}
