import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { authKeys } from '../queryKeys'
import { useAuthStore, type AuthUser } from '../../store/useAuthStore'
import { useProfileStore } from '../../store/useProfileStore'
import { CITIES } from '../../lib/cities'

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
  GET /auth/me — the boot revalidator. Enabled for a real cookie-backed session
  (participant or organization), so its 401 clears a stale identity. The mock
  organizer session (no real cookie) is left alone. When organizer auth is wired
  later, drop the role condition.
*/
export function useCurrentUser() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authService.me,
    enabled: user?.role === 'participant' || user?.role === 'organization',
  })
}
