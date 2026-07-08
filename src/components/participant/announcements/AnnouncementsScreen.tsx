import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { useAnnouncements } from '../../../api/queries/announcements.queries'
import { useAnnouncementReads } from '../../../store/useAnnouncementReads'
import { dayBucketLabel, type TimeStrings } from '../../../lib/relativeTime'
import { AnnouncementListItem } from './AnnouncementListItem'
import { AnnouncementsSkeleton } from './AnnouncementsSkeleton'
import { EmptyState } from '../../auth/EmptyState'
import type { Announcement } from '../../../api/services/announcements.service'

/*
  The participant announcements feed at /camp/announcements. Owns the query and
  hands each item to the presentational AnnouncementListItem. Pinned items sit in
  their own section on top; the rest are grouped by day. Loading → skeleton,
  empty → friendly state, error → retry. Opening an item (detail route) is what
  marks it read; here we only READ the client read-set to draw unread dots.
*/
export function AnnouncementsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isPending, isError, refetch } = useAnnouncements()
  const readIds = useAnnouncementReads((s) => s.readIds)
  const read = new Set(readIds)

  const open = (id: string) => navigate(`/camp/announcements/${id}`)

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
        <h1 className="font-display text-2xl font-bold tracking-tight text-content">
          {t.announcements.title}
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending ? (
          <AnnouncementsSkeleton />
        ) : isError || !data ? (
          <ErrorState
            message={t.announcements.error}
            retry={t.announcements.retry}
            onRetry={() => refetch()}
          />
        ) : data.length === 0 ? (
          <EmptyFeed title={t.announcements.empty} body={t.announcements.emptyBody} />
        ) : (
          <Feed
            data={data}
            read={read}
            time={t.time}
            labels={{ today: t.announcements.today, yesterday: t.announcements.yesterday }}
            pinnedLabel={t.announcements.pinned}
            onOpen={open}
          />
        )}
      </div>
    </div>
  )
}

function Feed({
  data,
  read,
  time,
  labels,
  pinnedLabel,
  onOpen,
}: {
  data: Announcement[]
  read: Set<string>
  time: TimeStrings
  labels: { today: string; yesterday: string }
  pinnedLabel: string
  onOpen: (id: string) => void
}) {
  const pinned = data.filter((a) => a.pinned)
  const rest = data.filter((a) => !a.pinned)

  // Group non-pinned items by day, preserving the newest-first order.
  const groups: { label: string; items: Announcement[] }[] = []
  for (const a of rest) {
    const label = dayBucketLabel(a.createdAt, time, labels)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(a)
    else groups.push({ label, items: [a] })
  }

  return (
    <div className="flex flex-col gap-4 px-[18px] pb-8 pt-2">
      {pinned.length > 0 && (
        <Section label={`📌 ${pinnedLabel}`}>
          {pinned.map((a) => (
            <AnnouncementListItem
              key={a.id}
              announcement={a}
              unread={!read.has(a.id)}
              onOpen={() => onOpen(a.id)}
            />
          ))}
        </Section>
      )}
      {groups.map((g) => (
        <Section key={g.label} label={g.label}>
          {g.items.map((a) => (
            <AnnouncementListItem
              key={a.id}
              announcement={a}
              unread={!read.has(a.id)}
              onOpen={() => onOpen(a.id)}
            />
          ))}
        </Section>
      ))}
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-meta font-bold uppercase tracking-wide text-muted">{label}</h2>
      {children}
    </section>
  )
}

function EmptyFeed({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <EmptyState className="mb-5 h-40 w-40" />
      <h2 className="text-heading font-bold text-content">{title}</h2>
      <p className="mt-2 max-w-xs text-body text-muted">{body}</p>
    </div>
  )
}

function ErrorState({
  message,
  retry,
  onRetry,
}: {
  message: string
  retry: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-danger-tint text-3xl">
        ⚠️
      </div>
      <p className="text-body text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-pine px-5 py-2 text-body font-bold text-white"
      >
        {retry}
      </button>
    </div>
  )
}
