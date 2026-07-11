import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'
import { interpolate } from '../../lib/interpolate'
import { Button } from '../ui'
import { PhoneInput } from '../auth/PhoneInput'
import { PHONE_LENGTH } from '../../lib/phone'
import { ApiError } from '../../api/axiosInstance'
import { useInvite, useAcceptInvite } from '../../api/queries/invites.queries'

/*
  Public organizer-invite accept page at /invite/:token. Validates the token, greets
  the invitee, and takes their phone to activate the account + start a session (the
  backend sets the cookie), then routes into /org. On-brand pine→deep backdrop.
*/
export function InviteAcceptScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const token = useParams().token ?? ''
  const invite = useInvite(token)
  const accept = useAcceptInvite(token)
  const [phone, setPhone] = useState('')

  const submit = () => {
    if (phone.length !== PHONE_LENGTH) return
    accept.mutate(phone, { onSuccess: () => navigate('/org', { replace: true }) })
  }

  const errorText =
    invite.error instanceof ApiError && invite.error.status === 410
      ? t.invite.expired
      : invite.isError
        ? t.invite.invalid
        : null

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-pine to-deep px-5">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-lg">
        {invite.isPending ? (
          <p className="text-body text-muted">{t.invite.loading}</p>
        ) : errorText ? (
          <p role="alert" className="text-title font-bold text-content">
            {errorText}
          </p>
        ) : (
          <>
            <h1 className="text-subhead font-bold text-content">
              {interpolate(t.invite.title, { name: invite.data!.name })}
            </h1>
            <p className="mb-5 mt-1 text-caption text-muted">{t.invite.subtitle}</p>

            <PhoneInput
              value={phone}
              onChange={setPhone}
              label={t.invite.phoneLabel}
              error={t.login.phoneError}
            />

            {accept.isError ? (
              <p role="alert" className="mt-3 text-caption font-semibold text-danger">
                {accept.error instanceof ApiError && accept.error.status === 409
                  ? t.login.phoneError
                  : t.invite.loadError}
              </p>
            ) : null}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-5"
              disabled={phone.length !== PHONE_LENGTH || accept.isPending}
              onClick={submit}
            >
              {t.invite.submit}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
