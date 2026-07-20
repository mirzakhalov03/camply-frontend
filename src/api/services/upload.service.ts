import { axiosInstance } from '../axiosInstance'

/*
  The upload SERVICE — a two-step boundary, because the two steps talk to two
  different hosts:

    1. presign()    → OUR API, to mint a short-lived write grant.
    2. uploadToS3() → AWS directly, with the file bytes.

  Step 2 deliberately uses plain `fetch`, NOT axiosInstance — the same reasoning
  already documented in weather.service.ts. axiosInstance attaches our session
  cookie (withCredentials) and our API base URL, both wrong for a third-party host;
  sending our auth cookie to S3 would leak it. No React here.
*/

/** What an uploaded image is for — mirrors the server's UPLOAD_PURPOSES. */
export type UploadPurpose = 'avatar' | 'group' | 'camp'

export type PresignRequest = {
  purpose: UploadPurpose
  contentType: string
  /** Exact byte length. The server SIGNS this, so it must match the body exactly. */
  size: number
}

export type PresignResponse = {
  uploadUrl: string
  /** The stable reference to persist on the owning resource. */
  key: string
  /** CDN URL when configured, otherwise the bare key. */
  publicUrl: string
  expiresIn: number
}

export const uploadService = {
  presign: async (input: PresignRequest): Promise<PresignResponse> =>
    (await axiosInstance.post<PresignResponse>('/uploads/presign', input)).data,

  /*
    PUT the file straight to S3. Content-Type must match what was signed and the
    body length must equal the signed ContentLength, or S3 rejects the request —
    which is exactly how the 5MB ceiling is enforced for real.
  */
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.status}`)
    }
  },
}
