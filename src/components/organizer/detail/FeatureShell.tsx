import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { CAMP_FEATURES } from './campFeatures'

/*
  Full-screen chrome for a single camp feature. Sticky header with a back arrow that
  returns to the organizer home (/org/camps — the launcher) and the feature title
  resolved from the campFeatures registry (i18n). The feature's own content — and any
  of its own controls, e.g. Schedule's "Add" — renders below, scrolling under it.
*/
export function FeatureShell({
  featureKey,
  children,
}: {
  featureKey: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const feature = CAMP_FEATURES.find((f) => f.key === featureKey)
  const title = feature ? feature.label(t) : ''

  return (
    <div className="pb-6 md:pb-8">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface-2/95 px-5 py-3 backdrop-blur-md md:px-8">
        <button
          type="button"
          onClick={() => navigate('/org/camps')}
          aria-label={t.org.detail.back}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-input border border-line bg-surface text-content active:scale-95"
        >
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
        </button>
        <h1 className="truncate text-heading font-bold text-content">{title}</h1>
      </header>
      <div className="px-5 pt-4 md:px-8">{children}</div>
    </div>
  )
}
