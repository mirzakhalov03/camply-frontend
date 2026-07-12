import { useMutation, useQuery } from '@tanstack/react-query'
import { invitesService } from '../services/invites.service'
import { inviteKeys } from '../queryKeys'
import { useAuthStore } from '../../store/useAuthStore'

/** Public invite lookup for the accept screen. Retries off — a 404/410 is terminal. */
export function useInvite(token: string) {
  return useQuery({
    queryKey: inviteKeys.detail(token),
    queryFn: () => invitesService.get(token),
    enabled: Boolean(token),
    retry: false,
  })
}

/** Accept the invite; on success the backend set the cookie — commit the identity. */
export function useAcceptInvite(token: string) {
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (phone: string) => invitesService.accept(token, phone),
    onSuccess: (user) => setUser(user),
  })
}
