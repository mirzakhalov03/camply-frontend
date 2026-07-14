import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { Field } from '../../ui'
import { useCreateCamp, useUpdateCamp } from '../../../api/queries/camps.queries'
import type { WizardDraft } from '../wizardTypes'

export function InfoStep({
  draft,
  onDraftChange,
  onSaved,
  registerSubmit,
}: {
  draft: WizardDraft
  onDraftChange: (patch: Partial<WizardDraft>) => void
  onSaved: (campId: string) => void
  registerSubmit: (fn: () => Promise<boolean>) => void
}) {
  const { t } = useTranslation()
  const c = t.createCamp // reuse existing camp-field labels (name/location/starts/ends/capacity/dateError)
  const create = useCreateCamp()
  const update = useUpdateCamp(draft.campId ?? '')
  const [error, setError] = useState<string | null>(null)

  // Keep the latest draft in a ref so the memoized submit fn always reads fresh values.
  const draftRef = useRef(draft)
  draftRef.current = draft

  useEffect(() => {
    registerSubmit(async () => {
      const d = draftRef.current
      if (!d.name.trim() || !d.location.trim() || !d.starts || !d.ends) {
        setError(c.required)
        return false
      }
      if (d.ends < d.starts) {
        setError(c.dateError)
        return false
      }
      const cap = d.capacity.trim() ? Number(d.capacity) : undefined
      const body = {
        name: d.name.trim(),
        location: d.location.trim(),
        startsAt: new Date(d.starts).toISOString(),
        endsAt: new Date(d.ends).toISOString(),
        ...(cap !== undefined && Number.isFinite(cap) && cap > 0 ? { capacity: cap } : {}),
      }
      try {
        if (d.campId) {
          await update.mutateAsync(body)
        } else {
          const camp = await create.mutateAsync(body)
          onSaved(camp.id)
        }
        setError(null)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : c.dateError)
        return false
      }
    })
  }, [registerSubmit, create, update, onSaved, c])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">{c.name}</label>
        <Field
          value={draft.name}
          onChange={(e) => onDraftChange({ name: e.target.value })}
          autoComplete="off"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.starts}</label>
          <Field
            type="date"
            value={draft.starts}
            onChange={(e) => onDraftChange({ starts: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.ends}</label>
          <Field
            type="date"
            value={draft.ends}
            min={draft.starts}
            onChange={(e) => onDraftChange({ ends: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">{c.location}</label>
        <Field
          value={draft.location}
          onChange={(e) => onDraftChange({ location: e.target.value })}
          autoComplete="off"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">{c.capacity}</label>
        <Field
          type="number"
          inputMode="numeric"
          min={1}
          value={draft.capacity}
          onChange={(e) => onDraftChange({ capacity: e.target.value })}
        />
      </div>
      {error && (
        <p role="alert" className="text-caption font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
