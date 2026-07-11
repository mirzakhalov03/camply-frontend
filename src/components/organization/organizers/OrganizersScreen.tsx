import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { Button, Skeleton } from '../../ui'
import { useOrganizers } from '../../../api/queries/organizers.queries'
import { OrganizerRow } from './OrganizerRow'
import { NewOrganizerSheet } from './NewOrganizerSheet'

/*
  The organizers dashboard at /admin/organizers — the org super-admin's list of the
  organizers it creates and deactivates. Pine→deep gradient header with a "+ New
  organizer" action; the body covers loading, error, empty, and list states.
*/
export function OrganizersScreen() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useOrganizers()
  const [open, setOpen] = useState(false)

  return (
    <div className="pb-24 md:pb-8">
      <div className="bg-gradient-to-b from-pine to-deep px-5 pb-6 pt-5 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-subhead font-bold text-white">{t.admin.organizers.title}</h1>
            {data ? (
              <p className="text-caption text-white/80">
                {interpolate(t.admin.organizers.subtitle, { count: data.length })}
              </p>
            ) : null}
          </div>
          <Button variant="accent" onClick={() => setOpen(true)}>
            {t.admin.organizers.new}
          </Button>
        </div>
      </div>

      <div className="px-5 pt-4 md:px-8">
        {isPending ? (
          <Skeleton className="h-40" tone="surface" />
        ) : isError || !data ? (
          <p className="py-8 text-center text-body text-muted">{t.admin.organizers.loadError}</p>
        ) : data.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-title font-bold text-content">{t.admin.organizers.empty}</p>
            <p className="mt-1 text-caption text-muted">{t.admin.organizers.emptyHint}</p>
          </div>
        ) : (
          <div className="rounded-card border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
            {data.map((o, i) => (
              <OrganizerRow key={o.id} organizer={o} last={i === data.length - 1} />
            ))}
          </div>
        )}
      </div>

      <NewOrganizerSheet open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
