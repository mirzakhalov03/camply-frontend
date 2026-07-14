import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Badge } from '../../ui'
import {
  useSetOrganizerActive,
  useResendInvite,
  useRevokeInvite,
  useDeleteOrganizer,
} from '../../../api/queries/organizers.queries'
import type { Organizer } from '../../../api/services/organizers.service'

/*
  One organizer row, driven by status:
   • pending     → shows email + phone; actions Resend + Revoke (revoke deletes the invite)
   • active      → shows phone; action Deactivate (revokes their sessions server-side)
   • deactivated → shows phone; action Reactivate
*/
export function OrganizerRow({ organizer, last }: { organizer: Organizer; last: boolean }) {
  const { t } = useTranslation()
  const setActive = useSetOrganizerActive()
  const resend = useResendInvite()
  const revoke = useRevokeInvite()
  const remove = useDeleteOrganizer()
  const busy = setActive.isPending || resend.isPending || revoke.isPending || remove.isPending

  const toggle = () => {
    if (organizer.status === 'active' && !window.confirm(t.admin.organizers.confirmDeactivate))
      return
    setActive.mutate({ id: organizer.id, active: organizer.status !== 'active' })
  }

  const onRevoke = () => {
    if (!window.confirm(t.admin.organizers.confirmRevoke)) return
    revoke.mutate(organizer.id)
  }

  const onDelete = () => {
    const name = `${organizer.name} ${organizer.surname}`.trim()
    if (!window.confirm(interpolate(t.admin.organizers.confirmDelete, { name }))) return
    remove.mutate(organizer.id)
  }

  const badge =
    organizer.status === 'pending'
      ? { tone: 'amber' as const, label: t.admin.organizers.pending }
      : organizer.status === 'active'
        ? { tone: 'pine' as const, label: t.admin.organizers.active }
        : { tone: 'muted' as const, label: t.admin.organizers.deactivated }

  const subtitle = organizer.status === 'pending' ? organizer.email : organizer.phone

  return (
    <div className={`flex items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-title font-bold text-content">
          {organizer.name} {organizer.surname}
        </div>
        <div className="truncate font-mono text-caption text-muted">{subtitle ?? '—'}</div>
        {organizer.status === 'pending' && organizer.phone ? (
          <div className="truncate font-mono text-caption text-muted">{organizer.phone}</div>
        ) : null}
      </div>
      <Badge tone={badge.tone}>{badge.label}</Badge>
      {organizer.status === 'pending' ? (
        <div className="flex flex-none gap-2">
          <button
            type="button"
            onClick={() => resend.mutate(organizer.id)}
            disabled={busy}
            className="text-caption font-bold text-pine transition active:scale-95 disabled:opacity-50"
          >
            {t.admin.organizers.resend}
          </button>
          <button
            type="button"
            onClick={onRevoke}
            disabled={busy}
            className="text-caption font-bold text-danger transition active:scale-95 disabled:opacity-50"
          >
            {t.admin.organizers.revoke}
          </button>
        </div>
      ) : (
        <div className="flex flex-none gap-3">
          <button
            type="button"
            onClick={toggle}
            disabled={busy}
            className="text-caption font-bold text-pine transition active:scale-95 disabled:opacity-50"
          >
            {organizer.status === 'active'
              ? t.admin.organizers.deactivate
              : t.admin.organizers.reactivate}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="text-caption font-bold text-danger transition active:scale-95 disabled:opacity-50"
          >
            {t.admin.organizers.delete}
          </button>
        </div>
      )}
    </div>
  )
}
