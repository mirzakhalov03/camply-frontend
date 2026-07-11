import { useTranslation } from '../../../i18n/useTranslation'
import { Badge } from '../../ui'
import { useSetOrganizerActive } from '../../../api/queries/organizers.queries'
import type { Organizer } from '../../../api/services/organizers.service'

/*
  One organizer row: name, phone (mono), a status Badge, and a Deactivate/Reactivate
  action. Deactivating asks for confirmation first (v1: window.confirm) — it revokes
  the organizer's sessions server-side, so it's a real safety lever, not cosmetic.
*/
export function OrganizerRow({ organizer, last }: { organizer: Organizer; last: boolean }) {
  const { t } = useTranslation()
  const setActive = useSetOrganizerActive()

  const toggle = () => {
    if (organizer.active && !window.confirm(t.admin.organizers.confirmDeactivate)) return
    setActive.mutate({ id: organizer.id, active: !organizer.active })
  }

  return (
    <div className={`flex items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-title font-bold text-content">
          {organizer.name} {organizer.surname}
        </div>
        <div className="font-mono text-caption text-muted">{organizer.phone ?? '—'}</div>
      </div>
      <Badge tone={organizer.active ? 'pine' : 'muted'}>
        {organizer.active ? t.admin.organizers.active : t.admin.organizers.deactivated}
      </Badge>
      <button
        type="button"
        onClick={toggle}
        disabled={setActive.isPending}
        className="flex-none text-caption font-bold text-pine transition active:scale-95 disabled:opacity-50"
      >
        {organizer.active ? t.admin.organizers.deactivate : t.admin.organizers.reactivate}
      </button>
    </div>
  )
}
