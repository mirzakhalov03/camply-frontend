import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { Skeleton } from '../../ui'
import { useAdminCamps } from '../../../api/queries/adminCamps.queries'
import { AdminCampCard } from './AdminCampCard'

/*
  The camps list at /admin/camps — every camp across every organizer (org-wide read
  view). Same gradient-header + state pattern as OrganizersScreen. Read-only: no
  "create camp" button (the org rarely creates camps and there's no backend to do so
  — a dead button would violate the "hidden button ≠ permission" guardrail).
*/
export function AdminCampsScreen() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useAdminCamps()

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <h1 className="text-subhead font-bold text-white">{t.admin.camps.title}</h1>
        {data ? (
          <p className="text-caption text-white/80">
            {interpolate(t.admin.camps.subtitle, { count: data.length })}
          </p>
        ) : null}
      </div>

      <div className="px-5 pt-4 md:px-8">
        {isPending ? (
          <Skeleton className="h-40" tone="surface" />
        ) : isError || !data ? (
          <p className="py-8 text-center text-body text-muted">{t.admin.camps.loadError}</p>
        ) : data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-title font-bold text-content">{t.admin.camps.empty}</p>
            <p className="mt-1 text-caption text-muted">{t.admin.camps.emptyHint}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {data.map((camp) => (
              <AdminCampCard key={camp.id} camp={camp} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
