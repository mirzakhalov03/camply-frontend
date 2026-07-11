import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '../../ui'
import { useTranslation } from '../../../i18n/useTranslation'
import { useOrganizerCamp } from '../../../api/queries/camps.queries'
import type { CampDetailContext } from './campDetailContext'

/*
  Camp Detail data boundary at `/org/camps/:campId`. Loads the camp meta once, owns
  the skeleton/error states, and hands `camp` to children via Outlet context — every
  feature window reads it without refetching. It renders no chrome of its own: each
  FeatureShell owns its own header. A bare camp URL redirects to the home launcher.
*/
export function CampDetailShell() {
  const { campId = '' } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const d = t.org.detail
  const campQuery = useOrganizerCamp(campId)

  if (campQuery.isPending) return <LoadingSkeleton />
  if (campQuery.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-card bg-danger-tint text-2xl">
          ⚠️
        </span>
        <p className="text-body text-muted">{d.loadError}</p>
        <button
          type="button"
          onClick={() => navigate('/org/camps')}
          className="rounded-full bg-pine px-5 py-2 text-caption font-bold text-white active:scale-95"
        >
          {d.back}
        </button>
      </div>
    )
  }

  const ctx: CampDetailContext = { camp: campQuery.data }
  return <Outlet context={ctx} />
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="h-28 bg-gradient-to-br from-pine to-pine-light md:h-32" />
      <div className="-mt-10 px-5 md:px-8">
        <Skeleton className="h-36" tone="surface" />
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 px-5 md:px-8 lg:grid-cols-3">
        <Skeleton className="h-28" tone="surface" />
        <Skeleton className="h-28" tone="surface" />
        <Skeleton className="h-28" tone="surface" />
        <Skeleton className="h-28" tone="surface" />
      </div>
    </div>
  )
}
