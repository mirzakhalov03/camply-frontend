import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { Button, Field } from '../../ui'
import { PhoneInput } from '../../auth/PhoneInput'
import { PHONE_LENGTH } from '@/utils/phone'
import { ApiError } from '../../../api/axiosInstance'
import { useCreateOrganizer } from '../../../api/queries/organizers.queries'

export function OrganizersStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const create = useCreateOrganizer()

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Organizers invited during THIS wizard session — the step starts empty; we never
  // show the org-wide roster here (a new camp isn't "pre-filled" with everyone).
  const [added, setAdded] = useState<
    { id: string; name: string; surname: string; contact: string }[]
  >([])

  const valid = name.trim() && surname.trim() && email.trim() && phone.length === PHONE_LENGTH

  const submit = () => {
    if (!valid) return
    setError(null)
    create.mutate(
      { name: name.trim(), surname: surname.trim(), email: email.trim(), phone },
      {
        onSuccess: ({ organizer }) => {
          setAdded((prev) => [
            {
              id: organizer.id,
              name: organizer.name,
              surname: organizer.surname,
              contact: organizer.email ?? organizer.phone ?? '',
            },
            ...prev,
          ])
          setName('')
          setSurname('')
          setEmail('')
          setPhone('')
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setError(
              err.message.toLowerCase().includes('phone')
                ? t.admin.create.duplicatePhone
                : t.admin.create.duplicate,
            )
          } else {
            setError(err instanceof Error ? err.message : t.admin.create.duplicate)
          }
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.organizersTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.organizersHint}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
        <div className="flex gap-3">
          <Field
            placeholder={`${w.orgName} *`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            placeholder={`${w.orgSurname} *`}
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>
        <Field
          type="email"
          placeholder={`${w.orgEmail} *`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />
        <PhoneInput
          value={phone}
          onChange={setPhone}
          label={`${t.addParticipant.phone} *`}
          error={t.login.phoneError}
        />
        {error ? (
          <p role="alert" className="text-caption font-semibold text-danger">
            {error}
          </p>
        ) : null}
        <Button variant="primary" fullWidth disabled={!valid || create.isPending} onClick={submit}>
          {w.addGroup /* reuse "Add" label */}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {added.map((o) => (
          <div
            key={o.id}
            className="flex items-center gap-3 rounded-input border border-line bg-surface px-3.5 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-body font-semibold text-content">
                {o.name} {o.surname}
              </div>
              <div className="truncate font-mono text-caption text-muted">{o.contact}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
