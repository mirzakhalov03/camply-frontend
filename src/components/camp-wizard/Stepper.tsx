import { useTranslation } from '../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
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
  const w = t.campWizard
  const currentIdx = steps.indexOf(current)

  return (
    <div className="px-5 pb-1 pt-3 md:px-8">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="truncate text-heading font-bold text-content">
          {w[LABEL_KEY[current]]}
        </span>
        <span className="flex-none text-meta font-semibold text-muted">
          {interpolate(w.stepProgress, { n: currentIdx + 1, total: steps.length })}
        </span>
      </div>
      <div className="flex gap-1.5">
        {steps.map((key, i) => {
          const done = i <= currentIdx
          const reachable = i <= currentIdx
          return (
            <button
              key={key}
              type="button"
              disabled={!reachable}
              onClick={() => reachable && onJump(key)}
              aria-label={w[LABEL_KEY[key]]}
              className={`h-1.5 flex-1 rounded-full transition-colors disabled:cursor-default ${
                done ? 'bg-pine' : 'bg-line'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
