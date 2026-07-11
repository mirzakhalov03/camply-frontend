import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { Button, Field, Sheet } from '../../ui'
import { PhoneInput } from '../../auth/PhoneInput'
import { PHONE_LENGTH } from '../../../lib/phone'
import { ApiError } from '../../../api/axiosInstance'
import { useCreateOrganizer } from '../../../api/queries/organizers.queries'

/*
  Create an organizer — a bottom Sheet with name, surname, phone (9 national digits
  via PhoneInput), and a password. On submit → useCreateOrganizer; a 409 (phone
  already registered) surfaces inline and keeps the sheet open; success closes it and
  the list refetches from the invalidated key.
*/
export function NewOrganizerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const create = useCreateOrganizer()

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const valid =
    name.trim().length > 0 &&
    surname.trim().length > 0 &&
    phone.length === PHONE_LENGTH &&
    password.length >= 8

  const reset = () => {
    setName('')
    setSurname('')
    setPhone('')
    setPassword('')
    setError(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    if (!valid) return
    setError(null)
    create.mutate(
      { phone, name: name.trim(), surname: surname.trim(), password },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
        onError: (err) =>
          setError(
            err instanceof ApiError && err.status === 409
              ? t.admin.create.duplicate
              : err instanceof Error
                ? err.message
                : t.admin.create.duplicate,
          ),
      },
    )
  }

  return (
    <Sheet open={open} onClose={close} closeLabel={t.notfound.back} title={t.admin.create.title}>
      <div className="flex flex-col gap-4 px-1 pb-2">
        <div>
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {t.admin.create.name}
          </label>
          <Field value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>

        <div>
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {t.admin.create.surname}
          </label>
          <Field value={surname} onChange={(e) => setSurname(e.target.value)} autoComplete="off" />
        </div>

        <PhoneInput
          value={phone}
          onChange={setPhone}
          label={t.admin.create.phone}
          error={t.login.phoneError}
        />

        <div>
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {t.admin.create.password}
          </label>
          <Field
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error ? (
          <p role="alert" className="text-caption font-semibold text-danger">
            {error}
          </p>
        ) : null}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!valid || create.isPending}
          onClick={submit}
        >
          {t.admin.create.submit}
        </Button>
      </div>
    </Sheet>
  )
}
