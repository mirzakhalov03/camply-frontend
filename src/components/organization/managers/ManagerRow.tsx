import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Badge } from '../../ui'
import {
  useSetManagerActive,
  useResendManagerInvite,
  useRevokeManagerInvite,
  useDeleteManager,
} from '../../../api/queries/managers.queries'
import type { Manager } from '../../../api/services/managers.service'

/*
  One manager row, driven by status (mirror of OrganizerRow):
   • pending     → email + phone; actions Resend + Revoke (revoke deletes the invite)
   • active      → phone; action Deactivate (revokes their sessions server-side)
   • deactivated → phone; actions Reactivate + Delete (two-step: only a deactivated
                   manager can be hard-deleted)
*/
export function ManagerRow({ manager, last }: { manager: Manager; last: boolean }) {
  const { t } = useTranslation()
  const setActive = useSetManagerActive()
  const resend = useResendManagerInvite()
  const revoke = useRevokeManagerInvite()
  const remove = useDeleteManager()
  const busy = setActive.isPending || resend.isPending || revoke.isPending || remove.isPending

  const toggle = () => {
    if (manager.status === 'active' && !window.confirm(t.admin.managers.confirmDeactivate)) return
    setActive.mutate({ id: manager.id, active: manager.status !== 'active' })
  }

  const onRevoke = () => {
    if (!window.confirm(t.admin.managers.confirmRevoke)) return
    revoke.mutate(manager.id)
  }

  const onDelete = () => {
    const name = `${manager.name} ${manager.surname}`.trim()
    if (!window.confirm(interpolate(t.admin.managers.confirmDelete, { name }))) return
    remove.mutate(manager.id)
  }

  const badge =
    manager.status === 'pending'
      ? { tone: 'amber' as const, label: t.admin.managers.pending }
      : manager.status === 'active'
        ? { tone: 'pine' as const, label: t.admin.managers.active }
        : { tone: 'muted' as const, label: t.admin.managers.deactivated }

  const subtitle = manager.status === 'pending' ? manager.email : manager.phone

  return (
    <div className={`flex items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
      <div className="min-w-0 flex-1">
        <div className="truncate text-title font-bold text-content">
          {manager.name} {manager.surname}
        </div>
        <div className="truncate font-mono text-caption text-muted">{subtitle ?? '—'}</div>
        {manager.status === 'pending' && manager.phone ? (
          <div className="truncate font-mono text-caption text-muted">{manager.phone}</div>
        ) : null}
      </div>
      <Badge tone={badge.tone}>{badge.label}</Badge>
      {manager.status === 'pending' ? (
        <div className="flex flex-none gap-2">
          <button
            type="button"
            onClick={() => resend.mutate(manager.id)}
            disabled={busy}
            className="text-caption font-bold text-pine transition active:scale-95 disabled:opacity-50"
          >
            {t.admin.managers.resend}
          </button>
          <button
            type="button"
            onClick={onRevoke}
            disabled={busy}
            className="text-caption font-bold text-danger transition active:scale-95 disabled:opacity-50"
          >
            {t.admin.managers.revoke}
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
            {manager.status === 'active'
              ? t.admin.managers.deactivate
              : t.admin.managers.reactivate}
          </button>
          {/* Two-step delete: only a deactivated manager can be removed outright
              (an active one must be deactivated first — the server 409s otherwise). */}
          {manager.status === 'deactivated' ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="text-caption font-bold text-danger transition active:scale-95 disabled:opacity-50"
            >
              {t.admin.managers.delete}
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
