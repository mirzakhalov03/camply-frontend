import { useTranslation } from '../../../i18n/useTranslation'
import { relativeTime } from '../../../lib/relativeTime'
import { initials } from '../../../lib/initials'
import { Avatar, Badge } from '../../ui'
import type { Announcement } from '../../../api/services/announcements.service'

type Props = {
  announcement: Announcement
  unread: boolean
  onOpen: () => void
}

/*
  One announcement in the feed. Pinned items get the amber "notice" treatment
  (matches the prototype); the rest are plain surface cards. An unread pine dot
  sits top-right until the participant opens it. The scope pill reads "All camp"
  (pine) or the group name (muted grey). Time is relative and localized. Purely
  presentational — the screen owns the data and the read-state.
*/
export function AnnouncementListItem({ announcement: a, unread, onOpen }: Props) {
  const { t } = useTranslation()
  const isGroup = a.scope.kind === 'group'

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`relative w-full rounded-card border p-4 text-left transition active:scale-[0.99] ${
        a.pinned ? 'border-amber/25 bg-amber-tint' : 'border-line bg-surface'
      }`}
    >
      {unread && (
        <span
          className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-pine"
          aria-label="Unread"
        />
      )}

      <div className="mb-2 flex flex-wrap items-center gap-2 pr-6">
        {a.pinned && (
          <span className="text-meta font-bold text-amber">📌 {t.announcements.pinned}</span>
        )}
        <Badge tone={isGroup ? 'muted' : 'pine'}>
          {a.scope.kind === 'group' ? a.scope.groupName : t.announcements.allCamp}
        </Badge>
        <span className="text-meta text-muted">· {relativeTime(a.createdAt, t.time)}</span>
      </div>

      {a.title && <p className="mb-1 text-title font-bold text-content">{a.title}</p>}
      <p className="line-clamp-2 text-body font-medium leading-snug text-content">{a.body}</p>

      <div className="mt-3 flex items-center gap-2">
        <Avatar
          name={a.author.name}
          initials={initials(a.author.name)}
          photo={a.author.photo}
          color={a.author.avatarColor}
          size="xs"
        />
        <span className="text-caption text-muted">{a.author.name}</span>
      </div>
    </button>
  )
}
