import { useNavigate } from 'react-router-dom'
import { CampWizard } from '../../camp-wizard/CampWizard'

/*
  Organizer adapter for the shared camp wizard — the organizer only fills
  Info/Groups/Participants/Review (no Organizers step, that's org-admin's job).
  Landing on Participants after "Create" lets the organizer immediately see who
  they just added.
*/
export function NewCampScreen() {
  const navigate = useNavigate()
  return (
    <CampWizard
      steps={['info', 'groups', 'participants', 'review']}
      onDone={(campId) => navigate(`/org/camps/${campId}/participants`)}
      onCancel={() => navigate('/org/camps')}
    />
  )
}
