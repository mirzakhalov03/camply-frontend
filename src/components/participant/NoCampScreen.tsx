import { useTranslation } from '../../i18n/useTranslation'

/*
  A logged-in participant with no live camp. Distinct from ComingSoon (which means
  "feature not built") — this is a real, expected state: rostered before the camp
  is published, not yet added to one, or their camp has already finished.

  The shell renders this INSTEAD of the routed screens, with no bottom nav and no
  SOS button: there's nothing to navigate within, and no camp organizer to signal.
*/
export function NoCampScreen() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col items-center justify-center bg-canvas px-8 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-green-tint text-4xl">
        ⛺️
      </div>
      <h1 className="font-display text-xl font-bold tracking-tight text-content">
        {t.noCamp.title}
      </h1>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{t.noCamp.body}</p>
      <p className="mt-4 text-xs text-muted">{t.noCamp.hint}</p>
    </div>
  )
}
