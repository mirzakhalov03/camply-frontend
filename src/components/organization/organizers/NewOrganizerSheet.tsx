import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Button, Field, Sheet } from '../../ui'
import { ApiError } from '../../../api/axiosInstance'
import { useCreateOrganizer } from '../../../api/queries/organizers.queries'

/*
  Invite an organizer by email. On submit → useCreateOrganizer; the backend creates a
  PENDING organizer and emails a magic link. Success shows a confirmation (and, in
  dev, a copyable invite link the backend returns so you can test without an inbox).
  A 409 (email already registered) surfaces inline.
*/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewOrganizerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const create = useCreateOrganizer()

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<{ email: string; inviteUrl?: string } | null>(null)

  const valid = name.trim().length > 0 && surname.trim().length > 0 && EMAIL_RE.test(email.trim())

  const reset = () => {
    setName('')
    setSurname('')
    setEmail('')
    setError(null)
    setSent(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    if (!valid) return
    setError(null)
    create.mutate(
      { name: name.trim(), surname: surname.trim(), email: email.trim().toLowerCase() },
      {
        onSuccess: (res) =>
          setSent({ email: email.trim().toLowerCase(), inviteUrl: res.inviteUrl }),
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
      {sent ? (
        <div className="flex flex-col gap-4 px-1 pb-2">
          <p className="text-body text-content">
            {interpolate(t.admin.create.sent, { email: sent.email })}
          </p>
          {sent.inviteUrl ? (
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(sent.inviteUrl!)}
              className="truncate rounded-input border border-line bg-surface px-3 py-2 text-left font-mono text-caption text-pine"
            >
              {t.admin.create.copyLink}: {sent.inviteUrl}
            </button>
          ) : null}
          <Button variant="primary" size="lg" fullWidth onClick={close}>
            {t.notfound.back}
          </Button>
        </div>
      ) : (
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
            <Field
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-caption font-semibold text-muted">
              {t.admin.create.email}
            </label>
            <Field
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
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
      )}
    </Sheet>
  )
}
