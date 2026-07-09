import { useState } from 'react'
import { Sheet, Button } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { useCreateActivity } from '../../../../api/queries/schedule.queries'
import { AudiencePicker, type AudienceScope } from '../AudiencePicker'

/*
  "Add activity" form (bottom sheet). Builds a NewActivity from date + start/end
  times + audience and fires useCreateActivity — which invalidates the camp schedule,
  so the new item reaches the organizer list AND the participant's schedule. Local,
  reversible: closing resets. Real validation would live server-side too.
*/
const inputClass =
  'w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-body text-content outline-none focus:border-pine placeholder:text-muted'

function todayStr(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function AddActivitySheet({
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
  const create = useCreateActivity(campId)

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(todayStr())
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [scope, setScope] = useState<AudienceScope>({ kind: 'camp' })

  const valid = title.trim().length > 0 && date && start && end

  const reset = () => {
    setTitle('')
    setLocation('')
    setDate(todayStr())
    setStart('09:00')
    setEnd('10:00')
    setScope({ kind: 'camp' })
  }

  const submit = () => {
    if (!valid) return
    create.mutate(
      {
        campId,
        title: title.trim(),
        location: location.trim(),
        startsAt: new Date(`${date}T${start}`).toISOString(),
        endsAt: new Date(`${date}T${end}`).toISOString(),
        scope,
        description: null,
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
    <Sheet open={open} onClose={onClose} closeLabel={d.cancel} title={d.newActivity}>
      <div className="flex flex-col gap-3.5">
        <Field label={d.activityName}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={d.activityNamePlaceholder}
            className={inputClass}
          />
        </Field>

        <Field label={d.dateLabel}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="flex gap-3">
          <Field label={d.startLabel} className="flex-1">
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label={d.endLabel} className="flex-1">
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={d.locationLabel}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={d.locationPlaceholder}
            className={inputClass}
          />
        </Field>

        <Field label={d.audience}>
          <AudiencePicker
            value={scope}
            onChange={setScope}
            allCampLabel={t.announcements.allCamp}
          />
        </Field>

        <Button variant="primary" size="lg" fullWidth disabled={!valid} onClick={submit}>
          {d.create}
        </Button>
      </div>
    </Sheet>
  )
}

function Field({
  label,
  className = '',
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-caption font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}
