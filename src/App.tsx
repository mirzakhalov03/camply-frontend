import { useState } from 'react'
import { ParticipantLogin } from './components/auth/ParticipantLogin'
import { CongratulationsScreen } from './components/auth/CongratulationsScreen'
import { NotFoundScreen } from './components/auth/NotFoundScreen'
import { SignUpScreen } from './components/signup/SignUpScreen'
import { OnboardingPager } from './components/OnboardingPager'
import { isKnownParticipant } from './lib/mockParticipants'

type Screen = 'login' | 'congrats' | 'signup' | 'notfound'

function App() {
  const [screen, setScreen] = useState<Screen>('login')

  // Mock roster check — routes to the success or not-found screen. Swap for a
  // real API call once auth is wired up.
  const handleLogin = (phone: string) => {
    const digits = phone.replace('+998', '')
    setScreen(isKnownParticipant(digits) ? 'congrats' : 'notfound')
  }

  if (screen === 'notfound') {
    return <NotFoundScreen onBack={() => setScreen('login')} />
  }

  // Congrats → Sign up live in a horizontal pager so pressing Continue slides
  // the Sign-Up screen in from the right (and Back slides it away again).
  if (screen === 'congrats' || screen === 'signup') {
    return (
      <OnboardingPager
        index={screen === 'signup' ? 1 : 0}
        panels={[
          <CongratulationsScreen key="congrats" onContinue={() => setScreen('signup')} />,
          <SignUpScreen
            key="signup"
            active={screen === 'signup'}
            onBack={() => setScreen('congrats')}
            onEnterCamp={() => {
              // The camp home screen doesn't exist yet — placeholder.
              console.log('enter the camp')
            }}
          />,
        ]}
      />
    )
  }

  return <ParticipantLogin onSubmit={handleLogin} />
}

export default App
