import { useMutation } from '@tanstack/react-query'
import { ApiError } from '../axiosInstance'
import { uploadService, type UploadPurpose } from '../services/upload.service'
import { validateUpload, type UploadErrorKey } from '@/lib/upload/validateUpload'

/*
  The upload QUERIES — the React layer over uploadService. Components use this hook
  only; never the service directly.

  Deliberately NOT a useQuery cache entry: an upload is a one-shot side effect whose
  result (a key) belongs to the OWNING resource, not to a cache of its own. The
  caller persists the returned key by PATCHing that resource, which invalidates
  whatever query already displays it.
*/

/** Every way an upload can fail, as a translation key under `t.upload`. */
export type UploadFailure = UploadErrorKey | 'unavailable' | 'failed'

export class UploadError extends Error {
  // Explicit field, not a TS parameter property — `erasableSyntaxOnly` is on.
  readonly errorKey: UploadFailure

  constructor(errorKey: UploadFailure) {
    super(errorKey)
    this.name = 'UploadError'
    this.errorKey = errorKey
  }
}

export function useUpload() {
  return useMutation({
    mutationFn: async ({
      file,
      purpose,
    }: {
      file: File
      purpose: UploadPurpose
    }): Promise<string> => {
      // Fail fast and locally — no network call for a file we already know is invalid.
      const check = validateUpload(file)
      if (!check.ok) throw new UploadError(check.errorKey)

      let presigned
      try {
        presigned = await uploadService.presign({
          purpose,
          contentType: file.type,
          size: file.size,
        })
      } catch (err) {
        // 503 means the bucket isn't configured — an operational state worth its own
        // message, not the generic failure copy.
        if (err instanceof ApiError && err.status === 503) throw new UploadError('unavailable')
        throw new UploadError('failed')
      }

      try {
        await uploadService.uploadToS3(presigned.uploadUrl, file)
      } catch {
        throw new UploadError('failed')
      }

      return presigned.key
    },
  })
}
