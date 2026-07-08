import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ParticipantLogin } from './auth/ParticipantLogin'
import { CongratulationsScreen } from './auth/CongratulationsScreen'
import { NotFoundScreen } from './auth/NotFoundScreen'
import { SignUpScreen } from './signup/SignUpScreen'
import { OrganizerInfoForm } from './organizer/OrganizerInfoForm'
import { OnboardingPager } from './OnboardingPager'
import { isKnownParticipant } from '../lib/mockParticipants'
import { isKnownOrganizer } from '../lib/mockOrganizers'
import { useProfileStore } from '../store/useProfileStore'

// Which onboarding step is showing. `congrats` + `form` ride the pager together.
// The pager stays local state (not routes) so its slide animation is preserved;
// stepping into the camp navigates to the real /camp route.
type Screen = 'login' | 'congrats' | 'form' | 'notfound'
// Which role's flow we're in — decided at login by which roster matched.
type Flow = 'participant' | 'organizer'

/*
  The pre-app onboarding surface, mounted at `/`. Owns the login → congrats → form
  slide flow with local state; on "Enter the camp" it hands off to the router
  (`/camp/home`), which is where the deep-linkable participant app begins.
*/
export function Onboarding() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState<Screen>('login')
  const [flow, setFlow] = useState<Flow>('participant')
  const setPhone = useProfileStore((s) => s.setPhone)

  // Mock roster check. Organizers are checked FIRST (a number in both lists would
  // open the organizer flow), then participants, else not-found. Swap for a real
  // API call once auth is wired up.
  const handleLogin = (phone: string) => {
    const digits = phone.replace('+998', '')
    if (isKnownOrganizer(digits)) {
      setFlow('organizer')
      setPhone(digits) // remembered so it shows on the profile screen later
      setScreen('congrats')
    } else if (isKnownParticipant(digits)) {
      setFlow('participant')
      setPhone(digits)
      setScreen('congrats')
    } else {
      setScreen('notfound')
    }
  }

  if (screen === 'notfound') {
    return <NotFoundScreen onBack={() => setScreen('login')} />
  }

  // Congrats → profile form live in a horizontal pager so pressing Continue slides
  // the form in from the right (and Back slides it away again). The two panels are
  // role-specific; the pager mechanics are shared.
  if (screen === 'congrats' || screen === 'form') {
    const isOrganizer = flow === 'organizer'
    return (
      <OnboardingPager
        index={screen === 'form' ? 1 : 0}
        panels={[
          <CongratulationsScreen
            key="congrats"
            variant={flow}
            onContinue={() => setScreen('form')}
          />,
          isOrganizer ? (
            <OrganizerInfoForm
              key="form"
              active={screen === 'form'}
              onBack={() => setScreen('congrats')}
              onEnterDashboard={() => {
                // The organizer dashboard doesn't exist yet — placeholder.
                console.log('go to organizer dashboard')
              }}
            />
          ) : (
            <SignUpScreen
              key="form"
              active={screen === 'form'}
              onBack={() => setScreen('congrats')}
              onEnterCamp={() => navigate('/camp/home')}
            />
          ),
        ]}
      />
    )
  }

  return <ParticipantLogin onSubmit={handleLogin} />
}
