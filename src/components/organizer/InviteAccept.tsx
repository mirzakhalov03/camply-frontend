import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'
import { useAcceptInvite, useInvite } from '../../api/queries/invite.queries'
import { ApiError } from '../../api/axiosInstance'
import { interpolate } from '@/utils/interpolate'
import { LanguageSwitcher } from '../auth/LanguageSwitcher'
import { Button, Skeleton } from '../ui'

/*
  The public invite-accept landing at /invite/:token — where an organization's
  emailed magic link lands. Controlling that inbox is the identity proof, so this
  screen is deliberately outside every auth guard: it greets the invitee by name
  (from GET /invite/:token) and, on a one-tap accept, starts a real organizer
  session → /org/welcome to finish onboarding. The phone was set by the org at
  invite time, so there's nothing to type here.

  Mirrors AdminLogin's on-brand pine→deep backdrop + surface card so dark mode stays
  intact. Two failure modes are kept visibly distinct: an invalid token (404) vs an
  expired one (410, which tells them to ask for a fresh link).
*/
export function InviteAccept() {
  const { token = '' } = useParams<{ token: string }>()
  const { t, selectedLang, setLanguage } = useTranslation()
  const navigate = useNavigate()
  const invite = useInvite(token)
  const accept = useAcceptInvite(token)
  const [serverError, setServerError] = useState<string | null>(null)

  const onAccept = () => {
    setServerError(null)
    accept.mutate(undefined, {
      onSuccess: () => navigate('/org/welcome', { replace: true }),
      onError: (err) => {
        const status = err instanceof ApiError ? err.status : undefined
        setServerError(status === 410 ? t.invite.expired : t.invite.invalid)
      },
    })
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-gradient-to-b from-pine to-deep">
      <header className="flex items-center justify-between px-5 py-3.5">
        <span className="font-display text-xl font-bold text-white">Camply</span>
        <LanguageSwitcher
          selected={selectedLang}
          onSelect={setLanguage}
          label={t.login.switchLanguage}
        />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-lg">
          {invite.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : invite.error ? (
            <div role="alert">
              <h1 className="text-subhead font-bold text-content">
                {invite.error instanceof ApiError && invite.error.status === 410
                  ? t.invite.expired
                  : t.invite.invalid}
              </h1>
            </div>
          ) : (
            <div>
              <h1 className="text-subhead font-bold text-content">
                {interpolate(t.invite.greeting, { name: invite.data?.name ?? '' })}
              </h1>
              <p className="mb-5 mt-1 text-caption text-muted">{t.invite.subtitle}</p>

              {serverError ? (
                <p role="alert" className="mb-2 text-caption font-semibold text-danger">
                  {serverError}
                </p>
              ) : null}

              <Button
                type="button"
                variant="primary"
                fullWidth
                disabled={accept.isPending}
                onClick={onAccept}
              >
                {t.invite.submit}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
