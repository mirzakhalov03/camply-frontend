import { Avatar } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { relativeTime } from '@/utils/relativeTime'
import { initials } from '@/utils/initials'
import type { Announcement } from '../../../../api/services/announcements.service'

/*
  One announcement in the organizer's list. Pinned items get the amber notice
  treatment (matches the participant feed); the scope pill reads "All camp" (pine)
  or the group name (muted). Presentational — the tab owns the data.
*/
export function OrgAnnouncementRow({ announcement: a }: { announcement: Announcement }) {
  const { t } = useTranslation()
  const isGroup = a.scope.kind === 'group'

  return (
    <div
      className={`rounded-card border p-4 ${
        a.pinned ? 'border-amber/25 bg-amber-tint' : 'border-line bg-surface'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {a.pinned ? (
          <span className="text-meta font-bold text-amber">📌 {t.announcements.pinned}</span>
        ) : null}
        <span
          className={`rounded-full px-2.5 py-1 text-meta font-bold ${
            isGroup ? 'bg-soft text-muted' : 'bg-green-tint text-pine'
          }`}
        >
          {a.scope.kind === 'group' ? a.scope.groupName : t.announcements.allCamp}
        </span>
        <span className="text-meta text-muted">· {relativeTime(a.createdAt, t.time)}</span>
      </div>

      {a.title ? <p className="mb-1 text-title font-bold text-content">{a.title}</p> : null}
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
    </div>
  )
}
