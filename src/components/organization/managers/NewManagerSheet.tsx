import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Button, Field, Sheet } from '../../ui'
import { PhoneInput } from '../../auth/PhoneInput'
import { PHONE_LENGTH } from '@/utils/phone'
import { ApiError } from '../../../api/axiosInstance'
import { useCreateManager } from '../../../api/queries/managers.queries'

/*
  Invite a manager by name, email + phone (mirror of NewOrganizerSheet). On submit →
  useCreateManager; the backend records the phone, creates a PENDING manager, and
  emails a magic link. Success shows a confirmation (and, in dev, a copyable invite
  link). A 409 — email OR phone already registered — surfaces inline. The generic
  field/sent copy is shared with the organizer sheet (t.admin.create); only the
  title + submit label are manager-flavored (t.admin.createManager).
*/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewManagerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const create = useCreateManager()

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('') // 9 raw national digits
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<{ email: string; inviteUrl?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Copy with a fallback: navigator.clipboard needs a secure context (localhost is
  // fine, plain-http LAN is not), so fall back to a hidden textarea + execCommand.
  const copyLink = async (url: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked — leave the full link visible so it can be selected by hand.
    }
  }

  const valid =
    name.trim().length > 0 &&
    surname.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    phone.length === PHONE_LENGTH

  const reset = () => {
    setName('')
    setSurname('')
    setEmail('')
    setPhone('')
    setError(null)
    setSent(null)
    setCopied(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    if (!valid) return
    setError(null)
    create.mutate(
      { name: name.trim(), surname: surname.trim(), email: email.trim().toLowerCase(), phone },
      {
        onSuccess: (res) =>
          setSent({ email: email.trim().toLowerCase(), inviteUrl: res.inviteUrl }),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setError(
              /phone/i.test(err.message) ? t.admin.create.duplicatePhone : t.admin.create.duplicate,
            )
            return
          }
          setError(err instanceof Error ? err.message : t.admin.create.duplicate)
        },
      },
    )
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      closeLabel={t.notfound.back}
      title={t.admin.createManager.title}
    >
      {sent ? (
        <div className="flex flex-col gap-4 px-1 pb-2">
          <p className="text-body text-content">
            {interpolate(t.admin.create.sent, { email: sent.email })}
          </p>
          {sent.inviteUrl ? (
            <button
              type="button"
              onClick={() => copyLink(sent.inviteUrl!)}
              className="flex flex-col gap-1 rounded-input border border-line bg-surface px-3 py-2 text-left transition-colors active:bg-soft"
            >
              <span className="text-caption font-semibold text-pine">
                {copied ? `✓ ${t.admin.create.copied}` : t.admin.create.copyLink}
              </span>
              <span className="truncate font-mono text-meta text-muted">{sent.inviteUrl}</span>
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

          <PhoneInput
            value={phone}
            onChange={(digits) => {
              setPhone(digits)
              if (error) setError(null)
            }}
            label={t.admin.create.phone}
            error={t.login.phoneError}
          />

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
            {t.admin.createManager.submit}
          </Button>
        </div>
      )}
    </Sheet>
  )
}
