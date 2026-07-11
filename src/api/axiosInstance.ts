import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/useAuthStore'

/*
  The single HTTP boundary for the whole app. Every backend call goes through
  this instance (via a service in `api/services/`) — never a raw fetch/axios in
  a component or query.

  In dev, requests hit `/api/*`, which Vite proxies to the Express backend on
  :4000 (see vite.config.ts). In prod set VITE_API_URL to the API origin.
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
  Response: pass successes through untouched (services read `res.data`). On
  failure, normalize to a plain Error carrying the backend's message so the UI /
  React Query see one predictable shape. A 401 means the token is dead — clear
  the session so guards bounce the user back to login.
*/
axiosInstance.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clear()
    }
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Something went wrong'
    return Promise.reject(new Error(message))
  },
)
