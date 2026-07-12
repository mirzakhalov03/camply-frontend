import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ParticipantLogin } from './auth/ParticipantLogin'
import { CongratulationsScreen } from './auth/CongratulationsScreen'
import { NotFoundScreen } from './auth/NotFoundScreen'
import { SignUpScreen } from './signup/SignUpScreen'
import { OnboardingPager } from './OnboardingPager'
import { useProfileStore } from '../store/useProfileStore'
import { useAuthStore } from '../store/useAuthStore'
import { useLogin, useCompleteProfile } from '../api/queries/auth.queries'
import { ApiError } from '../api/axiosInstance'

// Which onboarding step is showing. `congrats` + `form` ride the pager together.
type Screen = 'login' | 'congrats' | 'form' | 'notfound'

/*
  The pre-app onboarding surface, mounted at `/`. Owns the login → congrats → form
  slide flow with local state; on "Enter the camp" it hands off to the router
  (`/camp/home`).

  This surface is PARTICIPANT-only: phone → POST /auth/login. A known participant
  with a completed profile goes straight to camp; a known-but-incomplete one
  completes their profile (PATCH /auth/me); an unknown phone is "not found".
  Organizers never land here — they enter via the emailed /invite/:token link and
  onboard at /org/welcome; a signed-in organizer who hits `/` is bounced there.
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
  const [loginError, setLoginError] = useState<string | null>(null)

  // A signed-in organizer never uses the participant landing — send them to their
  // own surface (onboarding if unfinished, dashboard otherwise).
  if (authUser?.role === 'organizer') {
    return <Navigate to={authUser.profileComplete ? '/org/camps' : '/org/welcome'} replace />
  }

  const handleLogin = (phone: string) => {
    const digits = phone.replace('+998', '')
    setLoginError(null)

    // Real participant auth: claim by phone.
    login.mutate(
      { phone: digits },
      {
        onSuccess: (user) => {
          setPhone(digits)
          // An organizer who signs in by phone here belongs on their own surface,
          // not the participant dashboard (email is their real entry, but a phone
          // login still resolves their account server-side).
          if (user.role === 'organizer') {
            navigate(user.profileComplete ? '/org/camps' : '/org/welcome', { replace: true })
          } else if (user.profileComplete) {
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
    content = (
      <OnboardingPager
        index={screen === 'form' ? 1 : 0}
        panels={[
          <CongratulationsScreen
            key="congrats"
            variant="participant"
            onContinue={() => setScreen('form')}
          />,
          <SignUpScreen
            key="form"
            active={screen === 'form'}
            onBack={() => setScreen('congrats')}
            onCommit={() => {
              // The form just committed to useProfileStore; persist it to the
              // participant's record. The session cookie is already set (login).
              const p = useProfileStore.getState()
              if (!p.city) return
              completeProfile.mutate({
                name: p.name,
                surname: p.surname,
                cityId: p.city.name,
                age: p.age,
                photo: p.photo,
              })
            }}
            onEnterCamp={() => navigate('/camp/home')}
          />,
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
