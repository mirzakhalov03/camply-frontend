import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inviteService } from '../services/invite.service'
import { inviteKeys, authKeys } from '../queryKeys'
import { useAuthStore } from '../../store/useAuthStore'

/*
  The invite QUERIES — the React layer over inviteService. Components call these
  hooks only; never the service or axios. `useInvite` is the pre-auth preview
  (retries would just delay a 404/410 "this invite isn't valid" state); accepting
  commits the new organizer identity the same way useLogin does.
*/

/** GET /invite/:token — the public preview. No retry: an expired/unknown token
 *  must surface immediately, not spin through retries first. */
export function useInvite(token: string) {
  return useQuery({
    queryKey: inviteKeys.detail(token),
    queryFn: () => inviteService.get(token),
    enabled: Boolean(token),
    retry: false,
  })
}

/** POST /invite/:token/accept → commit the identity, same as useLogin. */
export function useAcceptInvite(token: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => inviteService.accept(token),
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user)
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}
