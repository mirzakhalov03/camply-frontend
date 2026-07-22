import { useTranslation } from '@/i18n/useTranslation'

/*
  Support entry — a row inside the profile "Settings" card on every surface
  (participant, organizer, organization). A plain external link to the Camply team's
  Telegram: no backend, no handler. The URL lives here ONCE so all three surfaces
  share a single source of truth; changing the handle (or later swapping Telegram for
  an in-app flow) is a one-file edit. Rendered as the LAST row of a settings card, so
  it carries no bottom border of its own — leading headset icon, label + subtitle,
  trailing chevron, matching the sibling settings rows.
*/
const SUPPORT_URL = 'https://t.me/camplyadmin'

export function SupportRow() {
  const { t } = useTranslation()

  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-3 py-3.5 text-left"
    >
      <span className="flex w-5 flex-none justify-center text-content">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-6a9 9 0 0 1 18 0v6a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
          <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-body font-semibold text-content">{t.profile.support}</div>
        <div className="truncate text-meta text-muted">{t.profile.supportSubtitle}</div>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-none text-line"
        aria-hidden
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </a>
  )
}
