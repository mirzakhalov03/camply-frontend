import { useState } from 'react'
import { ParticipantLogin } from './components/auth/ParticipantLogin'
import { CongratulationsScreen } from './components/auth/CongratulationsScreen'
import { NotFoundScreen } from './components/auth/NotFoundScreen'
import { SignUpScreen } from './components/signup/SignUpScreen'
import { OrganizerInfoForm } from './components/organizer/OrganizerInfoForm'
import { OnboardingPager } from './components/OnboardingPager'
import { isKnownParticipant } from './lib/mockParticipants'
import { isKnownOrganizer } from './lib/mockOrganizers'

// Which onboarding step is showing. `congrats` + `form` ride the pager together.
type Screen = 'login' | 'congrats' | 'form' | 'notfound'
// Which role's flow we're in — decided at login by which roster matched.
type Flow = 'participant' | 'organizer'

function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [flow, setFlow] = useState<Flow>('participant')

  // Mock roster check. Organizers are checked FIRST (a number in both lists would
  // open the organizer flow), then participants, else not-found. Swap for a real
  // API call once auth is wired up.
  const handleLogin = (phone: string) => {
    const digits = phone.replace('+998', '')
    if (isKnownOrganizer(digits)) {
      setFlow('organizer')
      setScreen('congrats')
    } else if (isKnownParticipant(digits)) {
      setFlow('participant')
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
              onEnterCamp={() => {
                // The camp home screen doesn't exist yet — placeholder.
                console.log('enter the camp')
              }}
            />
          ),
        ]}
      />
    )
  }

  return <ParticipantLogin onSubmit={handleLogin} />
}

export default App
