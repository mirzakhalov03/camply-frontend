import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { queryClient } from './queryClient'
import { participantKeys } from './queryKeys'

/*
  The single HTTP boundary for the whole app. Every backend call goes through this
  instance (via a service in `api/services/`) — never a raw fetch/axios in a
  component or query. Auth rides an httpOnly session cookie (`camply_sid`), so we
  send credentials on every request; there is no token in JS. In dev, requests hit
  `/api/*`, which Vite proxies to Express :4000 (same-origin, so the cookie flows).
*/
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15_000,
  withCredentials: true, // send/receive the httpOnly session cookie
  headers: { 'Content-Type': 'application/json' },
})

/*
  No request interceptor: the credential is the backend's httpOnly `camply_sid`
  cookie, sent automatically because of `withCredentials`. JavaScript can't read
  it (that's the point — an XSS bug can't steal it), so there's no token to attach.
*/

/** The backend's error envelope — adjust the field names when the API is real. */
type ApiErrorBody = { message?: string; error?: string }

/*
  A normalized error that also carries the HTTP status, so callers can branch on
  it — e.g. onboarding treats a 401 on login as "not on the roster".
*/
export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

/*
  Successes pass through untouched (services read `res.data`). On failure we
  normalize to an ApiError carrying the backend message + status.

  Two statuses get side effects:
    401 — the session is dead; clear it so guards bounce back to login.
    403 on a camp route — membership changed underneath us (removed from the camp,
         or it was archived). Re-resolving the participant's camps lands them on
         the no-camp screen instead of stranding them on a permanent error.
*/
axiosInstance.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status
    if (status === 401) useAuthStore.getState().clear()
    if (status === 403 && (error.config?.url ?? '').startsWith('/camps/')) {
      queryClient.invalidateQueries({ queryKey: participantKeys.camps })
    }
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Something went wrong'
    return Promise.reject(new ApiError(message, status))
  },
)
