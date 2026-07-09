import { useState } from 'react'
import { Skeleton } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { useAnnouncements } from '../../../../api/queries/announcements.queries'
import { useCampDetail } from '../campDetailContext'
import { OrgAnnouncementRow } from './OrgAnnouncementRow'
import { ComposeAnnouncementSheet } from './ComposeAnnouncementSheet'

/*
  Announcements tab — the organizer composes + reviews the camp's announcements.
  Reads the same feed the participant sees (useAnnouncements); "New announcement"
  opens a composer that writes back to the shared cache (pinned-first ordering is
  the service's job). Loading/empty/error states per ReadyProduct §9.
*/
export function AnnouncementsTab() {
  const { camp } = useCampDetail()
  const { t } = useTranslation()
  const d = t.org.detail
  const [composeOpen, setComposeOpen] = useState(false)
  const { data, isPending, isError } = useAnnouncements(camp.id)

  return (
    <div className="flex flex-col gap-2.5 pt-1">
      <button
        type="button"
        onClick={() => setComposeOpen(true)}
        className="flex items-center gap-3 rounded-card bg-pine p-4 text-left shadow-[0_6px_16px_rgba(15,107,79,0.22)] active:scale-[0.99]"
      >
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-white/15 text-white">
          <SendIcon />
        </span>
        <span className="text-title font-bold text-white">{d.newAnnouncement}</span>
      </button>

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

      <ComposeAnnouncementSheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        campId={camp.id}
      />
    </div>
  )
}

function SendIcon() {
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
      <path d="M3 11l18-8-8 18-2-7-8-3z" />
    </svg>
  )
}
