import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { PhoneInput } from '../../auth/PhoneInput'
import { PHONE_LENGTH } from '@/utils/phone'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

export function ParticipantsStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const a = t.addParticipant
  const groups = useCampDraftStore((s) => s.groups)
  const participants = useCampDraftStore((s) => s.participants)
  const addParticipant = useCampDraftStore((s) => s.addParticipant)

  const [groupTempId, setGroupTempId] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const activeGroup = groupTempId ?? groups[0]?.tempId ?? null
  const members = participants.filter((p) => p.groupTempId === activeGroup)
  const valid = phone.length === PHONE_LENGTH

  const submit = () => {
    if (!valid || !activeGroup) return
    if (participants.some((p) => p.phone === phone)) {
      setError(a.duplicate)
      return
    }
    addParticipant(phone, activeGroup)
    setPhone('')
    setError(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.participantsTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.participantsHint}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => {
          const on = g.tempId === activeGroup
          return (
            <button
              key={g.tempId}
              type="button"
              onClick={() => setGroupTempId(g.tempId)}
              className={`flex-none rounded-full border px-4 py-2 text-caption font-semibold ${
                on ? 'border-pine bg-green-tint text-pine' : 'border-line bg-surface text-muted'
              }`}
            >
              {g.name}
            </button>
          )
        })}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <PhoneInput
            value={phone}
            onChange={(d) => {
              setPhone(d)
              if (error) setError(null)
            }}
            label={a.phone}
            error={t.login.phoneError}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!valid || !activeGroup}
          className="mb-0.5 flex-none rounded-input bg-pine px-4 py-3 text-caption font-bold text-white disabled:opacity-50 active:scale-95"
        >
          {w.addGroup}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-caption font-semibold text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {members.map((p) => (
          <div
            key={p.tempId}
            className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-body text-content">{p.phone}</div>
              <div className="text-meta text-muted">{w.pending}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
