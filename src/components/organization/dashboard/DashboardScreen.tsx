import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { Button, Skeleton } from '../../ui'
import { useOrganizers } from '../../../api/queries/organizers.queries'
import { useAdminCamps } from '../../../api/queries/adminCamps.queries'
import { OrganizerRow } from '../organizers/OrganizerRow'
import { NewOrganizerSheet } from '../organizers/NewOrganizerSheet'

/*
  The organization's landing screen at /admin/dashboard. Live stats derived from the
  real GET /organizers list (shared via React Query with the Organizers screen — no
  extra fetch) plus a camps count from the mock-seam camps query. Quick actions reuse
  the existing NewOrganizerSheet; recent organizers reuse OrganizerRow. Invents no
  data and adds no new endpoint.
*/
export function DashboardScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)

  const organizers = useOrganizers()
  const camps = useAdminCamps()

  const list = organizers.data ?? []
  const activeCount = list.filter((o) => o.status === 'active').length
  const pendingCount = list.filter((o) => o.status === 'pending').length
  const stats = [
    { label: t.admin.dashboard.stats.organizers, value: list.length },
    { label: t.admin.dashboard.stats.active, value: activeCount },
    { label: t.admin.dashboard.stats.pending, value: pendingCount },
    { label: t.admin.dashboard.stats.camps, value: camps.data?.length ?? 0 },
  ]

  const recent = list.slice(0, 4)

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <h1 className="text-subhead font-bold text-white">{t.admin.dashboard.title}</h1>
        <p className="text-caption text-white/80">{t.admin.dashboard.subtitle}</p>
      </div>

      <div className="flex flex-col gap-6 px-5 pt-5 md:px-8">
        {/* Stat tiles */}
        {organizers.isPending ? (
          <Skeleton className="h-24" tone="surface" />
        ) : organizers.isError ? (
          <p className="py-6 text-center text-body text-muted">{t.admin.dashboard.loadError}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-card border border-line bg-surface px-4 py-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]"
              >
                <div className="text-display font-bold text-content">{s.value}</div>
                <div className="mt-0.5 text-caption text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => setSheetOpen(true)}>
            {t.admin.dashboard.quickActions.addOrganizer}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/camps')}>
            {t.admin.dashboard.quickActions.viewCamps}
          </Button>
        </div>

        {/* Recent organizers */}
        {recent.length > 0 ? (
          <div>
            <h2 className="mb-2 text-title font-bold text-content">
              {t.admin.dashboard.recentOrganizers}
            </h2>
            <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
              {recent.map((o, i) => (
                <OrganizerRow key={o.id} organizer={o} last={i === recent.length - 1} />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <NewOrganizerSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
