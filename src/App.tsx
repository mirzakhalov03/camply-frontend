import { useState } from 'react'
import { ParticipantLogin } from './components/auth/ParticipantLogin'
import { CongratulationsScreen } from './components/auth/CongratulationsScreen'
import { NotFoundScreen } from './components/auth/NotFoundScreen'
import { isKnownParticipant } from './lib/mockParticipants'

type Screen = 'login' | 'congrats' | 'notfound'

function App() {
  const [screen, setScreen] = useState<Screen>('login')

  // Mock roster check — routes to the success or not-found screen. Swap for a
  // real API call once auth is wired up.
  const handleLogin = (phone: string) => {
    const digits = phone.replace('+998', '')
    setScreen(isKnownParticipant(digits) ? 'congrats' : 'notfound')
  }

  if (screen === 'congrats') {
    return (
      <CongratulationsScreen
        onContinue={() => {
          // Next screen doesn't exist yet — placeholder.
          console.log('continue from congratulations')
        }}
      />
    )
  }

  if (screen === 'notfound') {
    return <NotFoundScreen onBack={() => setScreen('login')} />
  }

  return <ParticipantLogin onSubmit={handleLogin} />
}

export default App
