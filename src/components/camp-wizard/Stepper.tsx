import { useTranslation } from '../../i18n/useTranslation'
import type { WizardStepKey } from './wizardTypes'

const LABEL_KEY: Record<
  WizardStepKey,
  'stepInfo' | 'stepGroups' | 'stepOrganizers' | 'stepParticipants' | 'stepReview'
> = {
  info: 'stepInfo',
  groups: 'stepGroups',
  organizers: 'stepOrganizers',
  participants: 'stepParticipants',
  review: 'stepReview',
}

export function Stepper({
  steps,
  current,
  onJump,
}: {
  steps: WizardStepKey[]
  current: WizardStepKey
  onJump: (key: WizardStepKey) => void
}) {
  const { t } = useTranslation()
  const currentIdx = steps.indexOf(current)

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-5 pb-1 pt-3 md:px-8">
      {steps.map((key, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        const reachable = i <= currentIdx
        return (
          <div key={key} className="flex flex-none items-center gap-1.5">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(key)}
              className="flex items-center gap-1.5 disabled:cursor-default"
            >
              <span
                className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-meta font-bold ${
                  active || done ? 'bg-pine text-white' : 'bg-soft text-muted'
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-meta font-semibold ${active ? 'text-content' : 'text-muted'}`}>
                {t.campWizard[LABEL_KEY[key]]}
              </span>
            </button>
            {i < steps.length - 1 ? (
              <span
                className={`h-0.5 w-5 flex-none rounded ${done ? 'bg-pine' : 'bg-line'}`}
                aria-hidden
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
