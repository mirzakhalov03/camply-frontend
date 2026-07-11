import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ParticipantLogin } from './auth/ParticipantLogin'
import { CongratulationsScreen } from './auth/CongratulationsScreen'
import { NotFoundScreen } from './auth/NotFoundScreen'
import { SignUpScreen } from './signup/SignUpScreen'
import { OrganizerInfoForm } from './organizer/OrganizerInfoForm'
import { OnboardingPager } from './OnboardingPager'
import { isKnownOrganizer } from '../lib/mockOrganizers'
import { useProfileStore } from '../store/useProfileStore'
import { useAuthStore } from '../store/useAuthStore'
import { useLogin, useCompleteProfile } from '../api/queries/auth.queries'
import { ApiError } from '../api/axiosInstance'

// Which onboarding step is showing. `congrats` + `form` ride the pager together.
type Screen = 'login' | 'congrats' | 'form' | 'notfound'
// Which role's flow we're in — decided at login.
type Flow = 'participant' | 'organizer'

/*
  The pre-app onboarding surface, mounted at `/`. Owns the login → congrats → form
  slide flow with local state; on "Enter the camp" it hands off to the router
  (`/camp/home`).

  Participant auth is REAL: phone → POST /auth/login. A known participant with a
  completed profile goes straight to camp; a known-but-incomplete one completes
  their profile (PATCH /auth/me); an unknown phone is "not found". The organizer
  flow stays MOCKED until its backend lands.
*/
export function Onboarding() {
  const navigate = useNavigate()
  const setPhone = useProfileStore((s) => s.setPhone)
  const authUser = useAuthStore((s) => s.user)

  const login = useLogin()
  const completeProfile = useCompleteProfile()

  // Resume an authenticated-but-incomplete participant straight at profile setup
  // (e.g. they claimed their spot, then closed the app before finishing).
  const resuming = authUser?.role === 'participant' && !authUser.profileComplete
  const [screen, setScreen] = useState<Screen>(resuming ? 'congrats' : 'login')
  const [flow, setFlow] = useState<Flow>(
    authUser?.role === 'organizer' ? 'organizer' : 'participant',
  )
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = (phone: string) => {
    const digits = phone.replace('+998', '')
    setLoginError(null)

    // Organizer onboarding stays mocked until its backend lands.
    if (isKnownOrganizer(digits)) {
      setFlow('organizer')
      setPhone(digits)
      setScreen('congrats')
      return
    }

    // Real participant auth: claim by phone.
    login.mutate(
      { phone: digits },
      {
        onSuccess: (user) => {
          setPhone(digits)
          setFlow('participant')
          if (user.profileComplete) {
            navigate('/camp/home')
          } else {
            setScreen('congrats')
          }
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 401) {
            setScreen('notfound')
          } else {
            setLoginError(err instanceof Error ? err.message : 'Something went wrong')
          }
        },
      },
    )
  }

  let content: ReactNode

  if (screen === 'notfound') {
    content = <NotFoundScreen onBack={() => setScreen('login')} />
  } else if (screen === 'congrats' || screen === 'form') {
    const isOrganizer = flow === 'organizer'
    content = (
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
                // MOCK organizer session (no backend yet) — commit an identity so
                // the /org guard passes, then hand off to the router.
                const p = useProfileStore.getState()
                useAuthStore.getState().setUser({
                  id: 'org-me',
                  phone: p.phone,
                  name: p.name,
                  surname: p.surname,
                  role: 'organizer',
                  cityId: null,
                  age: null,
                  photo: null,
                  profileComplete: true,
                })
                navigate('/org/camps')
              }}
            />
          ) : (
            <SignUpScreen
              key="form"
              active={screen === 'form'}
              onBack={() => setScreen('congrats')}
              onCommit={() => {
                // The form just committed to useProfileStore; persist it to the
                // participant's record. The session cookie is already set (login).
                const p = useProfileStore.getState()
                if (!p.city) return
                completeProfile.mutate({ cityId: p.city.name, age: p.age, photo: p.photo })
              }}
              onEnterCamp={() => navigate('/camp/home')}
            />
          ),
        ]}
      />
    )
  } else {
    content = <ParticipantLogin onSubmit={handleLogin} />
  }

  return (
    <div className="theme-light h-full">
      {content}
      {loginError && (
        <p
          role="alert"
          className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-caption text-danger"
        >
          {loginError}
        </p>
      )}
    </div>
  )
}
