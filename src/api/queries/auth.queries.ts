import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { authKeys } from '../queryKeys'
import { useAuthStore, type AuthUser } from '../../store/useAuthStore'
import { useProfileStore } from '../../store/useProfileStore'
import { CITIES } from '@/utils/cities'

/*
  The auth QUERIES — the React layer over authService. Components call these hooks;
  they never touch axios or the service directly. Login/complete-profile are
  MUTATIONS; `me` is the boot revalidator. The real session is the httpOnly cookie;
  these hooks keep the cached identity (useAuthStore) and the editable profile
  (useProfileStore) in sync with it.
*/

// Commit the server identity into the auth store, and mirror the editable fields
// into the profile store so the Profile screen renders for a returning participant
// who never touched the sign-up form this session.
function commitUser(user: AuthUser) {
  useAuthStore.getState().setUser(user)
  const profile = useProfileStore.getState()
  // The org has no phone (it signs in by username); only participants/organizers do.
  if (user.phone) profile.setPhone(user.phone.replace('+998', ''))
  const city = user.cityId ? (CITIES.find((c) => c.name === user.cityId) ?? null) : null
  if (city && typeof user.age === 'number') {
    const initials = ((user.name[0] ?? '') + (user.surname[0] ?? '')).toUpperCase()
    profile.setRegistration({
      name: user.name,
      surname: user.surname,
      city,
      age: user.age,
      photo: user.photo,
      initials,
    })
  }
}

/** POST /auth/login → commit the identity. Returns the AuthUser to the caller. */
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      commitUser(user)
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

/** PATCH /auth/me → commit the completed profile. */
export function useCompleteProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.completeProfile,
    onSuccess: (user) => {
      commitUser(user)
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

/** POST /auth/logout → clear everything and return to onboarding. */
export function useLogout() {
  const navigate = useNavigate()
  const clear = useAuthStore((s) => s.clear)
  const resetProfile = useProfileStore((s) => s.reset)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authService.logout,
    // Clear locally even if the network call fails — the user asked to leave.
    onSettled: () => {
      clear()
      resetProfile()
      queryClient.clear()
      navigate('/', { replace: true })
    },
  })
}

/*
  GET /auth/me — the boot revalidator AND reconciler. The httpOnly cookie is the
  only real session; the persisted store is just a cached copy of who we think we
  are. On boot we ask the server who the cookie *actually* belongs to and commit
  that answer back into the store — so the store can never outrank the real cookie.
  Without this, a stale persisted role (e.g. "organization" left over from an
  earlier login) would let RequireAdmin render the admin UI while the cookie is a
  participant, and every write would 403 "Insufficient permissions".

  A 401 (dead cookie) is handled by the axios interceptor, which clears the store.
  Enabled for any cached identity — all roles now have real cookie sessions
  (organizer auth is wired via the invite-accept flow), so there's no mock session
  to leave alone anymore.
*/
export function useCurrentUser() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const me = await authService.me()
      commitUser(me) // reconcile: the cookie's identity wins over the stale store
      return me
    },
    enabled: !!user,
  })
}
