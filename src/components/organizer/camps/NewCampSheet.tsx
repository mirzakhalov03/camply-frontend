import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { Button, Field, Sheet } from '../../ui'
import { useCreateCamp } from '../../../api/queries/camps.queries'

/*
  Create a camp — a bottom Sheet with name, location, start/end date, and an
  optional capacity. The two native date inputs give 'YYYY-MM-DD'; we send them as
  ISO datetimes (the backend createCampSchema requires .datetime()). End-before-
  start is caught client-side; any backend 400 surfaces inline and keeps the sheet
  open. On success the sheet closes and the camps list + summary refetch (the
  useCreateCamp mutation invalidates their keys).
*/
export function NewCampSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const c = t.createCamp
  const create = useCreateCamp()

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [starts, setStarts] = useState('') // YYYY-MM-DD (native date input)
  const [ends, setEnds] = useState('')
  const [capacity, setCapacity] = useState('')
  const [error, setError] = useState<string | null>(null)

  // ISO date strings sort lexicographically, so a plain compare orders the dates.
  const datesValid = Boolean(starts && ends) && ends >= starts
  const valid = name.trim().length > 0 && location.trim().length > 0 && datesValid

  const reset = () => {
    setName('')
    setLocation('')
    setStarts('')
    setEnds('')
    setCapacity('')
    setError(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    if (!name.trim() || !location.trim() || !starts || !ends) return
    if (ends < starts) {
      setError(c.dateError)
      return
    }
    setError(null)
    const cap = capacity.trim() ? Number(capacity) : undefined
    create.mutate(
      {
        name: name.trim(),
        location: location.trim(),
        startsAt: new Date(starts).toISOString(),
        endsAt: new Date(ends).toISOString(),
        ...(cap !== undefined && Number.isFinite(cap) && cap > 0 ? { capacity: cap } : {}),
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
        onError: (err) => setError(err instanceof Error ? err.message : c.dateError),
      },
    )
  }

  return (
    <Sheet open={open} onClose={close} closeLabel={t.notfound.back} title={c.title}>
      <div className="flex flex-col gap-4 px-1 pb-2">
        <div>
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.name}</label>
          <Field value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>

        <div>
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.location}</label>
          <Field
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-caption font-semibold text-muted">{c.starts}</label>
            <Field type="date" value={starts} onChange={(e) => setStarts(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-caption font-semibold text-muted">{c.ends}</label>
            <Field
              type="date"
              value={ends}
              min={starts}
              onChange={(e) => setEnds(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.capacity}</label>
          <Field
            type="number"
            inputMode="numeric"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
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
          {c.submit}
        </Button>
      </div>
    </Sheet>
  )
}
