import { useNavigate } from 'react-router-dom'
import { OrganizerInfoForm } from './OrganizerInfoForm'
import { useProfileStore } from '../../store/useProfileStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useCompleteProfile } from '../../api/queries/auth.queries'

/*
  Real organizer onboarding at /org/welcome — reached once the invite is accepted
  (a live organizer session exists, but profileComplete is false). Renders the
  shared OrganizerInfoForm with the group step dropped (a fresh organizer has no
  camp yet; coordinators pick a group later, per camp) and wires its submit to the
  real PATCH /auth/me. The picked role is stored verbatim as the organizer's
  subRole — the frontend OrganizerRole keys ARE the backend ORGANIZER_SUB_ROLES
  values ("store, don't enforce").

  On submit the profile persists (useCompleteProfile → setUser flips
  profileComplete=true), so by the time the success overlay's "enter dashboard"
  is tapped, the /org guard's requireProfile check passes and /org/camps loads.
*/
export function OrganizerOnboarding() {
  const navigate = useNavigate()
  const completeProfile = useCompleteProfile()
  // A manager is an account tier, not a job — skip the sub-role picker. Organizers
  // still pick one (stored, not enforced). The server ignores subRole for managers.
  const isManager = useAuthStore((s) => s.user?.role) === 'manager'

  return (
    <OrganizerInfoForm
      withGroup={false}
      withRole={!isManager}
      onSubmit={(role) => {
        const p = useProfileStore.getState()
        if (!p.city) return
        completeProfile.mutate({
          name: p.name,
          surname: p.surname,
          cityId: p.city.name,
          age: p.age,
          photo: p.photo,
          ...(role ? { subRole: role } : {}),
        })
      }}
      onEnterDashboard={() => navigate('/org/camps')}
    />
  )
}
