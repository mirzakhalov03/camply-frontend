import { useNavigate } from 'react-router-dom'
import { CampWizard } from '../../camp-wizard/CampWizard'

export function AdminNewCampScreen() {
  const navigate = useNavigate()
  return (
    <CampWizard
      steps={['info', 'groups', 'organizers', 'participants', 'review']}
      onDone={(campId) => navigate(`/admin/camps/${campId}`)}
      onCancel={() => navigate('/admin/camps')}
    />
  )
}
