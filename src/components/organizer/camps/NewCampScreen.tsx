import { Navigate, useNavigate } from 'react-router-dom'
import { CampWizard } from '../../camp-wizard/CampWizard'
import { useAuthStore } from '../../../store/useAuthStore'

/*
  Manager adapter for the shared camp wizard. Camp creation is a MANAGER capability
  (the org can too) — organizers have no create path, so they're redirected out (the
  server also 403s POST /organizer/camps). The manager fills the full wizard,
  including the Organizers step: a manager may invite organizers onto their camp.
  After "Create" they return to the camps list — the org surface's main view.
*/
export function NewCampScreen() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const canCreateCamp = role === 'manager' || role === 'organization'
  if (!canCreateCamp) return <Navigate to="/org/camps" replace />

  return (
    <CampWizard
      steps={['info', 'groups', 'organizers', 'participants', 'review']}
      onDone={() => navigate('/org/camps')}
      onCancel={() => navigate('/org/camps')}
    />
  )
}
