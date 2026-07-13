import { useRef, useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { useProfileStore } from '../../../store/useProfileStore'
import { formatUzPhone } from '@/utils/phone'

/*
  Contact card: email, phone, city. Phone comes from login and city from
  registration, so both are read-only here. Email is NOT collected at signup —
  the camper adds it here — so its row is tap-to-edit: tap to reveal an input,
  Enter or blur saves to the store, Escape cancels.
*/
export function InfoList() {
  const { t } = useTranslation()
  const email = useProfileStore((s) => s.email)
  const phone = useProfileStore((s) => s.phone)
  const city = useProfileStore((s) => s.city)
  const setEmail = useProfileStore((s) => s.setEmail)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  // Escape closes the input, which fires onBlur → commit. This flag lets commit
  // tell "cancelled" apart from a real blur/Enter, so Escape truly discards.
  const cancelRef = useRef(false)

  const startEdit = () => {
    setDraft(email)
    setEditing(true)
  }
  const commit = () => {
    if (cancelRef.current) {
      cancelRef.current = false
      setEditing(false)
      return
    }
    setEmail(draft.trim())
    setEditing(false)
  }
  const cancel = () => {
    cancelRef.current = true
    setEditing(false)
  }

  const phoneDisplay = phone ? `+998 ${formatUzPhone(phone)}` : t.profile.notSet
  const cityDisplay = city?.name ?? t.profile.notSet

  return (
    <div className="rounded-[20px] border border-line bg-surface px-[18px] shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
      {/* Email — editable */}
      <div className="flex items-center gap-3 border-b border-line py-[13px]">
        <span className="w-[22px] text-base">✉️</span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-muted">{t.profile.email}</div>
          {editing ? (
            <input
              autoFocus
              type="email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') cancel()
              }}
              placeholder={t.profile.addEmail}
              className="mt-0.5 w-full bg-transparent text-[13px] font-semibold text-content outline-none placeholder:font-normal placeholder:text-muted"
            />
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="mt-0.5 block max-w-full truncate text-left text-[13px] font-semibold"
            >
              {email ? (
                <span className="text-content">{email}</span>
              ) : (
                <span className="font-normal text-muted">{t.profile.addEmail}</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Phone — read-only (from login) */}
      <Row icon="📞" label={t.profile.phone} value={phoneDisplay} bordered />

      {/* City — read-only (from registration) */}
      <Row icon="📍" label={t.profile.city} value={cityDisplay} />
    </div>
  )
}

function Row({
  icon,
  label,
  value,
  bordered,
}: {
  icon: string
  label: string
  value: string
  bordered?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 py-[13px] ${bordered ? 'border-b border-line' : ''}`}>
      <span className="w-[22px] text-base">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-muted">{label}</div>
        <div className="mt-0.5 truncate text-[13px] font-semibold text-content">{value}</div>
      </div>
    </div>
  )
}
