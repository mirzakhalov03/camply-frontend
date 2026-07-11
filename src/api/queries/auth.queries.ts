import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth.service'
import { authKeys } from '../queryKeys'
import { useAuthStore } from '../../store/useAuthStore'

/*
  The auth QUERIES — the React layer over authService. Components call these
  hooks; they never touch axios or the service directly. Login/register are
  MUTATIONS (they change server state and, on success, commit the session so the
  interceptor starts sending the token). `me` is a QUERY, gated on having a token.
  Keys come from the registry (../queryKeys), never inlined.

  When the onboarding flow adopts real auth, the login screen swaps its
  store-only `setPhone` for useLogin(), and the /camp guard can trust the token.
*/

/** POST /auth/login → commit the session on success. */
export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (session) => {
      setSession(session)
      queryClient.setQueryData(authKeys.me, session.user)
    },
  })
}

/** POST /auth/register → commit the session on success (auto sign-in). */
export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (session) => {
      setSession(session)
      queryClient.setQueryData(authKeys.me, session.user)
    },
  })
}

/** GET /auth/me → the authenticated user; only runs once we have a stored identity. */
export function useCurrentUser() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authService.me,
    enabled: Boolean(user),
  })
}
