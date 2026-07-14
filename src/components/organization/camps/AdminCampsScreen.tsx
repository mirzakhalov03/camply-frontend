import { Link } from 'react-router-dom'
import { useTranslation } from '../../../i18n/useTranslation'
import { Skeleton } from '../../ui'
import { useOrganizerCamps, useOrganizerSummary } from '../../../api/queries/camps.queries'
import { OrgCampCard } from './OrgCampCard'

/*
  "Camps history" — /admin/camps. Flipped from the mock org-wide read view
  (useAdminCamps + AdminCampCard) to the REAL organizer camps + summary queries, the
  same data the organizer's own dashboard reads (camps.queries.ts). Gradient header
  with 3 stat pills (total / active / participants), a "Create new camp" CTA, then
  the camp cards. Loading (Skeleton) / empty / error states are preserved.
*/
export function AdminCampsScreen() {
  const { t } = useTranslation()
  const camps = useOrganizerCamps()
  const summary = useOrganizerSummary()

  const list = camps.data ?? []
  const active = list.filter((c) => c.status === 'active').length

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <h1 className="text-subhead font-bold text-white">{t.admin.camps.title}</h1>
        <div className="mt-4 flex gap-2.5">
          <HeaderStat value={list.length} label={t.admin.camps.total} />
          <HeaderStat value={active} label={t.admin.camps.active} />
          <HeaderStat
            value={summary.data?.totalParticipants ?? 0}
            label={t.campWizard.statParticipants}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3.5 px-5 pt-4 md:px-8">
        <Link
          to="/admin/camps/new"
          className="flex items-center gap-3 rounded-card border border-dashed border-line bg-surface px-4 py-3.5 active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-input bg-pine text-white">
            ＋
          </span>
          <div>
            <div className="text-body font-bold text-content">{t.admin.camps.create}</div>
            <div className="text-caption text-muted">{t.admin.camps.createHint}</div>
          </div>
        </Link>

        {camps.isPending ? (
          <Skeleton className="h-40" tone="surface" />
        ) : camps.isError ? (
          <p className="py-8 text-center text-body text-muted">{t.admin.camps.loadError}</p>
        ) : list.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-title font-bold text-content">{t.admin.camps.empty}</p>
            <p className="mt-1 text-caption text-muted">{t.admin.camps.emptyHint}</p>
          </div>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {list.map((camp) => (
              <OrgCampCard key={camp.id} camp={camp} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HeaderStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 rounded-input bg-white/12 px-3 py-2.5">
      <div className="text-subhead font-bold text-white">{value}</div>
      <div className="text-meta text-white/75">{label}</div>
    </div>
  )
}
