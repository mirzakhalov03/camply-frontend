/*
  The ONE client-side definition of what may be uploaded. Mirrors the server's
  presignSchema (Backend/src/validators/upload.validators.ts) — if you change one,
  change both.

  Client validation exists for FEEDBACK, not security: it saves a doomed round trip
  and gives an instant, translated reason. The real ceiling is enforced by the
  presign validator and by S3's exact signed ContentLength.
*/

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Ready for a file input's `accept` attribute. */
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(',')

/** Translation keys under `t.upload` — callers render, never hand-roll, the message. */
export type UploadErrorKey = 'tooLarge' | 'wrongType'

export type UploadValidation = { ok: true } | { ok: false; errorKey: UploadErrorKey }

export function validateUpload(file: File): UploadValidation {
  if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    return { ok: false, errorKey: 'wrongType' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, errorKey: 'tooLarge' }
  }
  return { ok: true }
}
