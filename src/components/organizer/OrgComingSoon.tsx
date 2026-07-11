import { useTranslation } from '../../i18n/useTranslation'

/*
  Honest placeholder for organizer routes that exist (so links/deep-links resolve)
  but land in a later slice — Chat, Profile, the Map tab, and Camp Detail. Renders
  a friendly "coming soon" instead of a dead end. `title` names the destination;
  falls back to the generic label.
*/
export function OrgComingSoon({ title }: { title?: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-card bg-soft text-3xl">
        🚧
      </span>
      <h1 className="text-subhead font-bold text-content">{title ?? t.org.camps.soon}</h1>
      <p className="max-w-xs text-body text-muted">{t.org.camps.soonBody}</p>
    </div>
  )
}
