import { useState } from 'react'
import { Sheet, Button } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useCreateAnnouncement } from '../../../../api/queries/announcements.queries'
import { AudiencePicker, type AudienceScope } from '../AudiencePicker'

/*
  "New announcement" composer (bottom sheet). Posts via useCreateAnnouncement, which
  invalidates the camp feed — so it reaches the organizer list AND the participant's
  Announcements screen. The author is stamped from the current session.
*/
const inputClass =
  'w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-body text-content outline-none focus:border-pine placeholder:text-muted'

export function ComposeAnnouncementSheet({
  open,
  onClose,
  campId,
}: {
  open: boolean
  onClose: () => void
  campId: string
}) {
  const { t } = useTranslation()
  const d = t.org.detail
  const user = useAuthStore((s) => s.user)
  const create = useCreateAnnouncement(campId)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [scope, setScope] = useState<AudienceScope>({ kind: 'camp' })
  const [pinned, setPinned] = useState(false)

  const valid = body.trim().length > 0

  const reset = () => {
    setTitle('')
    setBody('')
    setScope({ kind: 'camp' })
    setPinned(false)
  }

  const submit = () => {
    if (!valid) return
    const authorName = user ? `${user.name} ${user.surname}`.trim() : 'Organizer'
    create.mutate(
      {
        campId,
        title: title.trim() || undefined,
        body: body.trim(),
        scope,
        pinned,
        author: {
          id: user?.id ?? 'org',
          name: authorName,
          role: 'organizer',
          avatarColor: 'var(--color-pine)',
        },
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      },
    )
  }

  return (
    <Sheet open={open} onClose={onClose} closeLabel={d.cancel} title={d.newAnnouncement}>
      <div className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold text-muted">{d.annTitleOptional}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold text-muted">{d.annMessage}</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={d.annMessagePlaceholder}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold text-muted">{d.audience}</span>
          <AudiencePicker
            value={scope}
            onChange={setScope}
            allCampLabel={t.announcements.allCamp}
          />
        </div>

        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          className="flex items-center justify-between rounded-input border border-line bg-surface px-3.5 py-2.5"
        >
          <span className="text-body font-semibold text-content">📌 {d.pinToTop}</span>
          <span
            className={`relative h-6 w-11 flex-none rounded-full transition ${pinned ? 'bg-pine' : 'bg-line'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                pinned ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </span>
        </button>

        <Button variant="primary" size="lg" fullWidth disabled={!valid} onClick={submit}>
          {d.create}
        </Button>
      </div>
    </Sheet>
  )
}
