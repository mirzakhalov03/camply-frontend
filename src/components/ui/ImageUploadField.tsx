import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { useUpload, UploadError, type UploadFailure } from '@/api/queries/upload.queries'
import { ACCEPT_ATTR } from '@/lib/upload/validateUpload'
import type { UploadPurpose } from '@/api/services/upload.service'

/*
  One image picker for every upload surface (profile photo, group photo, camp
  cover). Owns pick → validate → presign → PUT → report-the-key, so no screen
  reimplements that sequence or its error copy.

  It reports a KEY, not a URL: the caller persists that key on the owning resource
  (PATCH /auth/me, PATCH a camp, …), which is where the server re-checks ownership.
*/
export function ImageUploadField({
  purpose,
  value,
  onUploaded,
  onRemove,
  label,
  className = '',
}: {
  purpose: UploadPurpose
  /** Currently stored image (URL or key) — rendered until a new one is picked. */
  value?: string | null
  onUploaded: (key: string) => void
  onRemove?: () => void
  label?: string
  className?: string
}) {
  const { t } = useTranslation()
  const u = t.upload
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUpload()

  const [preview, setPreview] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState<UploadFailure | null>(null)

  /*
    Revoke the object URL when it changes or the field unmounts. The cleanup runs
    with the PREVIOUS value before the next effect, so it owns revocation and the
    handler below just swaps the URL — no leaks.
  */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const pick = () => inputRef.current?.click()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return

    setErrorKey(null)
    // Show the local preview immediately — the upload continues behind it.
    setPreview(URL.createObjectURL(file))

    upload.mutate(
      { file, purpose },
      {
        onSuccess: (key) => onUploaded(key),
        onError: (err) => {
          setErrorKey(err instanceof UploadError ? err.errorKey : 'failed')
          setPreview(null) // the stored image is still the truth
        },
      },
    )
  }

  const remove = () => {
    setPreview(null)
    setErrorKey(null)
    onRemove?.()
  }

  const shown = preview ?? value ?? null

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-caption font-semibold text-muted">{label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={onChange}
        className="hidden"
        aria-hidden
      />

      <div className="relative aspect-[5/2] w-full overflow-hidden rounded-card">
        {shown ? (
          <>
            <img src={shown} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {/* Top scrim keeps the glass pills legible over any image. */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={pick}
                disabled={upload.isPending}
                className="rounded-full bg-black/45 px-3 py-1 text-caption font-bold text-white backdrop-blur-sm transition active:scale-95 disabled:opacity-60"
              >
                {u.change}
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={upload.isPending}
                className="rounded-full bg-black/45 px-3 py-1 text-caption font-bold text-white backdrop-blur-sm transition active:scale-95 disabled:opacity-60"
              >
                {u.remove}
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={pick}
            disabled={upload.isPending}
            aria-label={u.cta}
            className="group flex h-full w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-pine/25 bg-gradient-to-br from-pine/[0.06] to-sky/[0.06] px-4 text-center transition hover:border-pine/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:opacity-60"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15 text-pine transition group-hover:scale-105">
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
            <span className="text-title font-bold text-content">{u.cta}</span>
            <span className="text-caption text-muted">{u.hint}</span>
          </button>
        )}

        {upload.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-full bg-black/55 px-3 py-1 text-caption font-bold text-white">
              {u.uploading}
            </span>
          </div>
        )}
      </div>

      {errorKey && (
        <p role="alert" className="text-caption font-semibold text-danger">
          {u[errorKey]}
        </p>
      )}
    </div>
  )
}
