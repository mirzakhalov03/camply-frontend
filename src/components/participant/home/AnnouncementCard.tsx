import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { CampHome } from '../../../lib/campHome'

type Props = {
  announcement: CampHome['announcement']
  /** Open the full announcements list. */
  onSeeAll: () => void
}

/*
  The latest pinned announcement, on the amber "notice" tint so it reads as
  camp-important without shouting. Header links out to the full list.
*/
export function AnnouncementCard({ announcement, onSeeAll }: Props) {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-content">{t.home.latestAnnouncement}</h2>
        <button type="button" onClick={onSeeAll} className="text-[13px] font-semibold text-pine">
          {t.home.all}
        </button>
      </div>

      <button
        type="button"
        onClick={onSeeAll}
        className="rounded-[20px] border border-amber/25 bg-amber-tint p-4 text-left"
      >
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#a86a08]">📌 {t.home.pinned}</span>
          <span className="text-[11px] text-muted">
            · {interpolate(t.home.minutesAgo, { minutes: announcement.minutesAgo })}
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug text-content">{announcement.body}</p>
        <p className="mt-2 text-xs text-muted">— {announcement.author}</p>
      </button>
    </section>
  )
}
