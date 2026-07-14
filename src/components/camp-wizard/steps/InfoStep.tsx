import { useEffect, useRef, useState } from 'react'
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
      <BannerUploader />

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

/*
  The camp cover uploader — the banner at the top of step 1. Upload isn't wired to
  the backend yet, so the picked image lives only as a local object-URL PREVIEW
  (component state, not the persisted draft) and never reaches the commit payload.
  When the upload endpoint lands, this graduates into useCampDraftStore.
*/
function BannerUploader() {
  const { t } = useTranslation()
  const w = t.campWizard
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  // Free the blob URL whenever `preview` changes or the step unmounts: the cleanup
  // runs with the PREVIOUS value before the next effect, so it owns revocation and
  // the handlers below just swap the URL (no leaks).
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const pick = () => inputRef.current?.click()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
    e.target.value = '' // allow re-picking the same file
  }

  const remove = () => setPreview(null)

  return (
    <div className="relative aspect-[5/2] w-full overflow-hidden rounded-card">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
        aria-hidden
      />

      {preview ? (
        <>
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {/* Top scrim keeps the glass pills legible over any image. */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={pick}
              className="rounded-full bg-black/45 px-3 py-1 text-caption font-bold text-white backdrop-blur-sm transition active:scale-95"
            >
              {w.bannerChange}
            </button>
            <button
              type="button"
              onClick={remove}
              className="rounded-full bg-black/45 px-3 py-1 text-caption font-bold text-white backdrop-blur-sm transition active:scale-95"
            >
              {w.bannerRemove}
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={pick}
          aria-label={w.bannerCta}
          className="group flex h-full w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-pine/25 bg-gradient-to-br from-pine/[0.06] to-sky/[0.06] px-4 text-center transition hover:border-pine/40 hover:from-pine/[0.09] hover:to-sky/[0.09] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15 text-pine transition group-hover:scale-105">
            {/* A camp landscape — sun over mountains — inside a frame. */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect
                x="3"
                y="4.5"
                width="18"
                height="15"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" />
              <path
                d="M4 17l4.2-5 3 3.2L15 10l5 6.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-title font-bold text-content">{w.bannerCta}</span>
          <span className="text-caption text-muted">{w.bannerHint}</span>
        </button>
      )}
    </div>
  )
}
