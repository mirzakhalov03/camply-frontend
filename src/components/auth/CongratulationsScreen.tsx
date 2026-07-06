import { useTranslation } from '../../i18n/useTranslation'
import { ResultScreen } from './ResultScreen'
import { PartyPopper } from './PartyPopper'
import { OnboardingProgress } from '../OnboardingProgress'

type Props = {
  /** Advance to the next step. Optional while the next screen doesn't exist. */
  onContinue?: () => void
}

/*
  Success screen shown after a participant's number matches the roster. Mirrors
  the reference layout via the shared ResultScreen, on Camply's deep-green
  gradient. Strings come from the shared i18n config.
*/
export function CongratulationsScreen({ onContinue }: Props) {
  const { t } = useTranslation()

  return (
    <ResultScreen
      title={t.congrats.title}
      message={t.congrats.message}
      illustration={<PartyPopper className="h-full w-full" />}
      actionLabel={t.congrats.continue}
      onAction={onContinue}
      topRight={<OnboardingProgress step={1} />}
    />
  )
}
