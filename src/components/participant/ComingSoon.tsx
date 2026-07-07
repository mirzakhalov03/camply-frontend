import { useTranslation } from '../../i18n/useTranslation'

type Props = {
  /** What this screen will become (e.g. "Map", "Today's schedule"). */
  title: string
  /** Shown when the screen isn't a bottom-nav tab, so there's a way back. */
  onBack?: () => void
}

/*
  Placeholder for the tabs/sections we haven't built yet. Keeps every button in
  the app "live" (it goes somewhere and says what's coming) instead of dead. A
  tent emoji + the section name, on the tinted canvas.
*/
export function ComingSoon({ title, onBack }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col bg-canvas">
      <header className="flex flex-none items-center gap-3 px-5 pb-2 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
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
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-content">{title}</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-green-tint text-4xl">
          ⛺️
        </div>
        <h2 className="text-lg font-bold text-content">{t.common.comingSoon}</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          {t.common.comingSoonBody}
        </p>
      </div>
    </div>
  )
}
