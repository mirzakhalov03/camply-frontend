import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Button, Skeleton } from '../../ui'
import { useManagers } from '../../../api/queries/managers.queries'
import { ManagerRow } from './ManagerRow'
import { NewManagerSheet } from './NewManagerSheet'

/*
  The managers dashboard at /admin/managers — the org super-admin's list of the
  managers it invites and deactivates (each manager owns and runs one camp). Mirror
  of OrganizersScreen: pine→deep gradient header with a "+ New manager" action; the
  body covers loading, error, empty, and list states.
*/
export function ManagersScreen() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useManagers()
  const [open, setOpen] = useState(false)

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-subhead font-bold text-white">{t.admin.managers.title}</h1>
            {data ? (
              <p className="text-caption text-white/80">
                {interpolate(t.admin.managers.subtitle, { count: data.length })}
              </p>
            ) : null}
          </div>
          <Button variant="accent" onClick={() => setOpen(true)}>
            {t.admin.managers.new}
          </Button>
        </div>
      </div>

      <div className="px-5 pt-4 md:px-8">
        {isPending ? (
          <Skeleton className="h-40" tone="surface" />
        ) : isError || !data ? (
          <p className="py-8 text-center text-body text-muted">{t.admin.managers.loadError}</p>
        ) : data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-title font-bold text-content">{t.admin.managers.empty}</p>
            <p className="mt-1 text-caption text-muted">{t.admin.managers.emptyHint}</p>
          </div>
        ) : (
          <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
            {data.map((m, i) => (
              <ManagerRow key={m.id} manager={m} last={i === data.length - 1} />
            ))}
          </div>
        )}
      </div>

      <NewManagerSheet open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
