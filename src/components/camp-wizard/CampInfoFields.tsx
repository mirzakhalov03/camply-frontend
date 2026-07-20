import { useTranslation } from '@/i18n/useTranslation'
import { Field, Select } from '@/components/ui'
import { CAMP_LOCATIONS } from '@/lib/campLocations'

/*
  The camp's core identity fields — name, dates, location, capacity — as ONE
  controlled, presentational component. Shared by two callers with different
  persistence models, which is exactly why it holds no state of its own:

    • InfoStep (create)     → writes into the persisted useCampDraftStore; nothing
                              reaches the server until the wizard's final commit.
    • EditCampSheet (edit)  → holds local state and PATCHes an existing camp.

  Keeping the layout here means the two can't drift into looking like different
  products. The wizard's cover-image uploader is deliberately NOT here: it's
  create-only chrome today and isn't wired to a backend yet.
*/

const REQ = <span className="text-danger"> *</span>

/** The editable shape. Structurally identical to CampDraftInfo, by design. */
export type CampInfoValue = {
  name: string
  location: string
  /** YYYY-MM-DD */
  starts: string
  ends: string
  capacity: string
}

export function CampInfoFields({
  value,
  onChange,
  error,
  minDate,
  showCapacity = true,
}: {
  value: CampInfoValue
  onChange: (patch: Partial<CampInfoValue>) => void
  error?: string | null
  /*
    Earliest selectable start date. Create passes today (you can't schedule a camp
    into the past); EDIT passes nothing — an existing camp may already have started,
    and clamping to today would make its own dates unselectable.
  */
  minDate?: string
  /*
    Capacity is create-only: GET /organizer/camps/:id doesn't return it, so an edit
    form would render it blank and blank it on the server on every save. Hidden in
    edit until the camp projection carries it.
  */
  showCapacity?: boolean
}) {
  const { t } = useTranslation()
  const c = t.createCamp
  const w = t.campWizard

  const locationOptions = CAMP_LOCATIONS.map((l) => ({ value: l, label: l }))

  return (
    <>
      <div>
        <label className="mb-1.5 block text-caption font-semibold text-muted">
          {c.name}
          {REQ}
        </label>
        <Field
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
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
            value={value.starts}
            min={minDate}
            onChange={(e) => onChange({ starts: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-caption font-semibold text-muted">
            {c.ends}
            {REQ}
          </label>
          <Field
            type="date"
            value={value.ends}
            min={value.starts || minDate}
            onChange={(e) => onChange({ ends: e.target.value })}
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
            value={value.location}
            onChange={(e) => onChange({ location: e.target.value })}
            options={locationOptions}
            placeholder={w.locationPlaceholder}
          />
        </div>
        {showCapacity && (
          <div className="flex-1">
            <label className="mb-1.5 block text-caption font-semibold text-muted">
              {c.capacity}
            </label>
            <Field
              type="number"
              inputMode="numeric"
              min={1}
              value={value.capacity}
              onChange={(e) => onChange({ capacity: e.target.value })}
              placeholder={w.capacityPlaceholder}
            />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-caption font-semibold text-danger">
          {error}
        </p>
      )}
    </>
  )
}
