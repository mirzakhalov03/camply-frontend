import type { AuthRole, AuthUser } from '@/store/useAuthStore'

/*
  Which account tiers live on the /org surface. Managers and organizers share it
  (the manager gets the fuller capability set); the org super-admin can land there
  too. Keep this as the ONE place that answers the question — scattering
  `role === 'organizer'` checks is how a manager ends up on the participant app.
*/
export function usesOrgSurface(role: AuthRole | undefined): boolean {
  return role === 'organizer' || role === 'manager' || role === 'organization'
}

/** Where an /org-surface user belongs right now: onboarding if unfinished, else the dashboard. */
export function orgLandingPath(user: Pick<AuthUser, 'profileComplete'>): string {
  return user.profileComplete ? '/org/camps' : '/org/welcome'
}
