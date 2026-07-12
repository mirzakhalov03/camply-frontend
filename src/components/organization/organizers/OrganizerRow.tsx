import { useTranslation } from '../../../i18n/useTranslation'
import { Badge } from '../../ui'
import {
  useSetOrganizerActive,
  useResendInvite,
  useRevokeInvite,
} from '../../../api/queries/organizers.queries'
import type { Organizer } from '../../../api/services/organizers.service'

/*
  One organizer row, driven by status:
   • pending     → shows email; actions Resend + Revoke (revoke deletes the invite)
   • active      → shows phone; action Deactivate (revokes their sessions server-side)
   • deactivated → shows phone; action Reactivate
*/
export function OrganizerRow({ organizer, last }: { organizer: Organizer; last: boolean }) {
  const { t } = useTranslation()
  const setActive = useSetOrganizerActive()
  const resend = useResendInvite()
  const revoke = useRevokeInvite()
  const busy = setActive.isPending || resend.isPending || revoke.isPending

  const toggle = () => {
    if (organizer.status === 'active' && !window.confirm(t.admin.organizers.confirmDeactivate))
      return
    setActive.mutate({ id: organizer.id, active: organizer.status !== 'active' })
  }

  const onRevoke = () => {
    if (!window.confirm(t.admin.organizers.confirmRevoke)) return
    revoke.mutate(organizer.id)
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
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className="flex-none text-caption font-bold text-pine transition active:scale-95 disabled:opacity-50"
        >
          {organizer.status === 'active'
            ? t.admin.organizers.deactivate
            : t.admin.organizers.reactivate}
        </button>
      )}
    </div>
  )
}
