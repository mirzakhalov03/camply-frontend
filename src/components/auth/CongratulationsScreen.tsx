import { useTranslation } from '../../i18n/useTranslation'
import { ResultScreen } from './ResultScreen'
import { PartyPopper } from './PartyPopper'
import { OrganizerBadge } from './OrganizerBadge'
import { OnboardingProgress } from '../OnboardingProgress'

type Props = {
  /** Advance to the next step. Optional while the next screen doesn't exist. */
  onContinue?: () => void
  /**
   * Which flow this celebrates. Both share the layout, headline and button; only
   * the illustration and message differ. Defaults to participant.
   */
  variant?: 'participant' | 'organizer'
}

/*
  Success screen shown after a number matches the roster. Mirrors the reference
  layout via the shared ResultScreen, on Camply's deep-green gradient. Serves both
  the participant (party popper) and organizer (lanyard badge) flows — same shape,
  swapped illustration + message. Strings come from the shared i18n config.
*/
export function CongratulationsScreen({ onContinue, variant = 'participant' }: Props) {
  const { t } = useTranslation()
  const isOrganizer = variant === 'organizer'

  return (
    <ResultScreen
      title={t.congrats.title}
      message={isOrganizer ? t.organizer.congratsMessage : t.congrats.message}
      illustration={
        isOrganizer ? (
          <OrganizerBadge className="h-full w-full" />
        ) : (
          <PartyPopper className="h-full w-full" />
        )
      }
      actionLabel={t.congrats.continue}
      onAction={onContinue}
      topRight={<OnboardingProgress step={1} />}
    />
  )
}
