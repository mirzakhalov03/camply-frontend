import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { Skeleton } from '../../ui'
import { useAnnouncements } from '../../../api/queries/announcements.queries'
import { OrgAnnouncementRow } from '../detail/announcements/OrgAnnouncementRow'

/*
  Organizer Notifications — a READ-ONLY feed of what's already been sent to
  participants (announcements ARE the notification mechanism here). Reached from the
  dashboard bell. Deliberately no composer: organizers send from a camp's
  Announcements tab; this screen only reviews what went out. Reuses the same
  useAnnouncements feed + OrgAnnouncementRow so this view can never drift from it.
*/
export function OrgNotificationsScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const c = t.org.camps
  const d = t.org.detail
  const { data, isPending, isError } = useAnnouncements()

  return (
    <div className="pb-6 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/org/camps')}
            aria-label={d.back}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-white/20 text-white active:scale-95"
          >
            <BackIcon />
          </button>
          <div className="min-w-0">
            <h1 className="text-subhead font-bold text-white">{c.notifications}</h1>
            <p className="text-caption text-white/80">{c.notificationsSubtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pt-4 md:px-8">
        {isPending ? (
          <>
            <Skeleton className="h-28" tone="surface" />
            <Skeleton className="h-28" tone="surface" />
          </>
        ) : isError ? (
          <p className="py-8 text-center text-body text-muted">{d.loadError}</p>
        ) : data.length === 0 ? (
          <p className="py-8 text-center text-body text-muted">{d.annEmpty}</p>
        ) : (
          data.map((a) => <OrgAnnouncementRow key={a.id} announcement={a} />)
        )}
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
