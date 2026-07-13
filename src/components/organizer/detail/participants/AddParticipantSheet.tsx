import { useState } from 'react'
import { useTranslation } from '../../../../i18n/useTranslation'
import { Button, Sheet } from '../../../ui'
import { PhoneInput } from '../../../auth/PhoneInput'
import { PHONE_LENGTH } from '@/utils/phone'
import { ApiError } from '../../../../api/axiosInstance'
import { useAddRoster } from '../../../../api/queries/roster.queries'

/*
  Add a participant to a camp — phone only (they name themselves when they claim
  the spot). A bottom Sheet with a single PhoneInput; on submit → useAddRoster,
  which posts the 9 national digits (the backend canonicalizes + provisions a
  pending membership). Two distinct 409s are surfaced inline: the phone is already
  in this camp (duplicate) vs already in two camps (the ≤2 rule). Success closes
  the sheet and the roster refetches; the new row shows the phone until onboarding.
*/
export function AddParticipantSheet({
  open,
  onClose,
  campId,
}: {
  open: boolean
  onClose: () => void
  campId: string
}) {
  const { t } = useTranslation()
  const a = t.addParticipant
  const add = useAddRoster(campId)

  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const valid = phone.length === PHONE_LENGTH

  const reset = () => {
    setPhone('')
    setError(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = () => {
    if (!valid) return
    setError(null)
    add.mutate(
      { phone },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            // Both roster 409s: the ≤2-camps rule vs a repeat add for this camp.
            setError(err.message.includes('2 camps') ? a.tooMany : a.duplicate)
          } else {
            setError(err instanceof Error ? err.message : a.duplicate)
          }
        },
      },
    )
  }

  return (
    <Sheet open={open} onClose={close} closeLabel={t.notfound.back} title={a.title}>
      <div className="flex flex-col gap-4 px-1 pb-2">
        <PhoneInput
          value={phone}
          onChange={(digits) => {
            setPhone(digits)
            if (error) setError(null)
          }}
          label={a.phone}
          error={t.login.phoneError}
        />

        {error ? (
          <p role="alert" className="text-caption font-semibold text-danger">
            {error}
          </p>
        ) : null}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!valid || add.isPending}
          onClick={submit}
        >
          {a.submit}
        </Button>
      </div>
    </Sheet>
  )
}
