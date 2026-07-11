import { useTranslation } from '../../i18n/useTranslation'
import { ResultScreen } from './ResultScreen'
import { EmptyState } from './EmptyState'

type Props = {
  /** Return to the login screen so the participant can re-enter their number. */
  onBack?: () => void
}

/*
  Shown when the entered number doesn't match any participant in the roster.
  Same shape as the success screen (shared ResultScreen), with the empty-state
  illustration and a Back action.
*/
export function NotFoundScreen({ onBack }: Props) {
  const { t } = useTranslation()

  return (
    <ResultScreen
      title={t.notfound.title}
      message={t.notfound.message}
      illustration={<EmptyState className="h-full w-full" />}
      actionLabel={t.notfound.back}
      onAction={onBack}
    />
  )
}
