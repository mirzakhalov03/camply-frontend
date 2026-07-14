import { useTranslation } from '../../../i18n/useTranslation'
import { Field, Select } from '../../ui'
import { CAMP_LOCATIONS } from '../../../lib/campLocations'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

const REQ = <span className="text-danger"> *</span>

export function InfoStep({ error }: { error: string | null }) {
  const { t } = useTranslation()
  const c = t.createCamp
  const w = t.campWizard
  const info = useCampDraftStore((s) => s.info)
  const patchInfo = useCampDraftStore((s) => s.patchInfo)

  const locationOptions = CAMP_LOCATIONS.map((l) => ({ value: l, label: l }))

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">
          {c.name}
          {REQ}
        </label>
        <Field
          value={info.name}
          onChange={(e) => patchInfo({ name: e.target.value })}
          placeholder={w.namePlaceholder}
          autoComplete="off"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {c.starts}
            {REQ}
          </label>
          <Field
            type="date"
            value={info.starts}
            onChange={(e) => patchInfo({ starts: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {c.ends}
            {REQ}
          </label>
          <Field
            type="date"
            value={info.ends}
            min={info.starts}
            onChange={(e) => patchInfo({ ends: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {c.location}
            {REQ}
          </label>
          <Select
            value={info.location}
            onChange={(e) => patchInfo({ location: e.target.value })}
            options={locationOptions}
            placeholder={w.locationPlaceholder}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">{c.capacity}</label>
          <Field
            type="number"
            inputMode="numeric"
            min={1}
            value={info.capacity}
            onChange={(e) => patchInfo({ capacity: e.target.value })}
            placeholder={w.capacityPlaceholder}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-caption font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
