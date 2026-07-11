import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/useAuthStore'

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
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

/** The backend's error envelope. */
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
  normalize to an ApiError carrying the backend message + status. A 401 means the
  session is dead — clear it so guards bounce back to login.
*/
axiosInstance.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status
    if (status === 401) useAuthStore.getState().clear()
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Something went wrong'
    return Promise.reject(new ApiError(message, status))
  },
)
