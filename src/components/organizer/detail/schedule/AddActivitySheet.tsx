import { useMemo, useState } from 'react'
import { Sheet, Button, Select } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { useCreateActivity } from '../../../../api/queries/schedule.queries'
import { AudiencePicker, type AudienceScope } from '../AudiencePicker'
import { datesInRange } from '@/utils/dateRange'
import type { OrganizerCamp } from '../../../../api/services/camps.service'

/*
  "Add activity" form (bottom sheet). Builds a NewActivity from date + start/end
  times + audience and fires useCreateActivity — which invalidates the camp schedule,
  so the new item reaches the organizer list AND the participant's schedule. The date
  is a dropdown bounded to the camp's duration (datesInRange over camp.startsAt/endsAt),
  so an activity can't be scheduled outside the camp. Required fields are marked with *
  and an inline error shows on an invalid submit. Local, reversible: closing resets.
*/
const inputClass =
  'w-full rounded-input border border-line bg-surface px-3.5 py-2.5 text-body text-content outline-none focus:border-pine placeholder:text-muted'

const REQ = <span className="text-danger"> *</span>

export function AddActivitySheet({
  open,
  onClose,
  camp,
}: {
  open: boolean
  onClose: () => void
  camp: OrganizerCamp
}) {
  const { t } = useTranslation()
  const d = t.org.detail
  const create = useCreateActivity(camp.id)

  // The camp's days as YYYY-MM-DD; label them for the current locale.
  const dayOptions = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    return datesInRange(camp.startsAt, camp.endsAt).map((value) => ({
      value,
      label: fmt.format(new Date(`${value}T00:00`)),
    }))
  }, [camp.startsAt, camp.endsAt])

  const firstDay = dayOptions[0]?.value ?? ''

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(firstDay)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [scope, setScope] = useState<AudienceScope>({ kind: 'camp' })
  const [showError, setShowError] = useState(false)

  const valid = title.trim().length > 0 && !!date && !!start && !!end

  const reset = () => {
    setTitle('')
    setLocation('')
    setDate(firstDay)
    setStart('09:00')
    setEnd('10:00')
    setScope({ kind: 'camp' })
    setShowError(false)
  }

  const submit = () => {
    if (!valid) {
      setShowError(true)
      return
    }
    create.mutate(
      {
        campId: camp.id,
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

  const missing = (v: string) => showError && !v.trim()

  return (
    <Sheet open={open} onClose={onClose} closeLabel={d.cancel} title={d.newActivity}>
      <div className="flex flex-col gap-3.5">
        <Field label={d.activityName} required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={d.activityNamePlaceholder}
            aria-invalid={missing(title)}
            className={`${inputClass} ${missing(title) ? 'border-danger' : ''}`}
          />
        </Field>

        <Field label={d.dateLabel} required>
          <Select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            options={dayOptions}
            placeholder={d.dateLabel}
          />
        </Field>

        <div className="flex gap-3">
          <Field label={d.startLabel} className="flex-1" required>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label={d.endLabel} className="flex-1" required>
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
          <AudiencePicker value={scope} onChange={setScope} allCampLabel={t.announcements.allCamp} />
        </Field>

        {showError && !valid && (
          <p role="alert" className="text-caption font-semibold text-danger">
            {d.activityRequired}
          </p>
        )}

        <Button variant="primary" size="lg" fullWidth onClick={submit}>
          {d.create}
        </Button>
      </div>
    </Sheet>
  )
}

function Field({
  label,
  className = '',
  required = false,
  children,
}: {
  label: string
  className?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-caption font-semibold text-muted">
        {label}
        {required && REQ}
      </span>
      {children}
    </label>
  )
}
