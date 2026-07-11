import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { useAnnouncement } from '../../../api/queries/announcements.queries'
import { useAnnouncementReads } from '../../../store/useAnnouncementReads'
import { absoluteDateTime } from '../../../lib/relativeTime'
import { initials } from '../../../lib/initials'
import { Avatar, Badge, Skeleton } from '../../ui'

/*
  A single announcement at /camp/announcements/:id — the deep-link target for
  pushes. Owns useAnnouncement(id) and marks the item read on mount (client
  read-state). Shows the full body, author, scope, exact localized time, and an
  "edited" note when updatedAt is present.
*/
export function AnnouncementDetailScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { data: a, isPending, isError } = useAnnouncement(id)
  const markRead = useAnnouncementReads((s) => s.markRead)

  // Opening it = reading it. Runs once the item resolves.
  useEffect(() => {
    if (a) markRead(a.id)
  }, [a, markRead])

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex flex-none items-center gap-3 px-5 pb-2 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t.announcements.back}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-soft text-content"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <h1 className="font-display text-xl font-bold tracking-tight text-content">
          {t.announcements.title}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-10 pt-2">
        {isPending ? (
          <div className="rounded-card border border-line bg-surface p-5">
            <Skeleton className="mb-3 h-4 w-40" tone="soft" />
            <Skeleton className="mb-2 h-4 w-full" tone="soft" />
            <Skeleton className="h-4 w-3/4" tone="soft" />
          </div>
        ) : isError || !a ? (
          <p className="mt-10 text-center text-body text-muted">{t.announcements.error}</p>
        ) : (
          <article
            className={`rounded-card border p-5 ${
              a.pinned ? 'border-amber/25 bg-amber-tint' : 'border-line bg-surface'
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {a.pinned && (
                <span className="text-meta font-bold text-amber">📌 {t.announcements.pinned}</span>
              )}
              <Badge tone={a.scope.kind === 'group' ? 'muted' : 'pine'}>
                {a.scope.kind === 'group' ? a.scope.groupName : t.announcements.allCamp}
              </Badge>
            </div>

            {a.title && <h2 className="mb-2 text-subhead font-bold text-content">{a.title}</h2>}
            <p className="whitespace-pre-line text-body leading-relaxed text-content">{a.body}</p>

            <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
              <Avatar
                name={a.author.name}
                initials={initials(a.author.name)}
                photo={a.author.photo}
                color={a.author.avatarColor}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-title font-bold text-content">{a.author.name}</p>
                <p className="text-caption text-muted">
                  {absoluteDateTime(a.createdAt, t.time)}
                  {a.updatedAt ? ` · ${t.announcements.edited}` : ''}
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
