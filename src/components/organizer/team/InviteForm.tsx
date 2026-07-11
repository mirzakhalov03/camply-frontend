import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { Button } from '../../ui'
import { RolePicker } from '../RolePicker'
import type { OrganizerRole } from '../roles'
import { useInviteTeamMember } from '../../../api/queries/team.queries'

/*
  Invite a co-organizer — a collapsed CTA that expands into a phone + role form.
  Reuses the onboarding RolePicker so the role set stays canonical (real sub-roles,
  not the dead Owner/Admin labels). Submitting adds a pending invite via the shared
  team mutation; the list refetches from the invalidated key.
*/
export function InviteForm() {
  const { t } = useTranslation()
  const tm = t.org.team
  const invite = useInviteTeamMember()

  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<OrganizerRole>('coordinator')

  const digits = phone.replace(/\D/g, '')
  const valid = digits.length >= 7

  const submit = () => {
    if (!valid) return
    invite.mutate(
      { phone: `+998 ${phone.trim()}`, role },
      {
        onSuccess: () => {
          setPhone('')
          setRole('coordinator')
          setOpen(false)
        },
      },
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-card bg-pine p-4 text-left shadow-[0_6px_16px_rgba(15,107,79,0.22)] active:scale-[0.99]"
      >
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-white/15 text-white">
          <PlusIcon />
        </span>
        <span className="text-white">
          <span className="block text-title font-bold">{tm.invite}</span>
          <span className="block text-caption text-white/75">{tm.inviteBody}</span>
        </span>
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-title font-bold text-content">{tm.invite}</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t.org.detail.cancel}
          className="text-muted"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-input border border-line bg-surface px-3.5 py-1">
        <span className="font-mono text-caption text-muted">+998</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={tm.phonePlaceholder}
          inputMode="tel"
          className="min-w-0 flex-1 bg-transparent py-2 text-body text-content outline-none placeholder:text-muted"
        />
      </div>

      <div className="text-meta font-bold uppercase tracking-wider text-muted">{tm.roleLabel}</div>
      <RolePicker value={role} onChange={setRole} labels={t.organizer.roles} />

      <Button variant="primary" size="lg" fullWidth disabled={!valid} onClick={submit}>
        {tm.sendInvite}
      </Button>
      <p className="text-center text-caption text-muted">{tm.inviteHint}</p>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
