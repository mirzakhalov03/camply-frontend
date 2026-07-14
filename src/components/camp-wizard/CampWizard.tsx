import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { Stepper } from './Stepper'
import { InfoStep } from './steps/InfoStep'
import { GroupsStep } from './steps/GroupsStep'
import { OrganizersStep } from './steps/OrganizersStep'
import { ParticipantsStep } from './steps/ParticipantsStep'
import { ReviewStep } from './steps/ReviewStep'
import { useCommitCampDraft } from '../../api/queries/campDraft.queries'
import { useCampDraftStore } from '../../store/useCampDraftStore'
import type { CampWizardProps, WizardStepKey } from './wizardTypes'

export function CampWizard({ steps, onDone, onCancel }: CampWizardProps) {
  const { t } = useTranslation()
  const w = t.campWizard
  const c = t.createCamp
  const [idx, setIdx] = useState(0)
  const [infoError, setInfoError] = useState<string | null>(null)
  const commit = useCommitCampDraft()
  const reset = useCampDraftStore((s) => s.reset)

  const current = steps[idx]
  const isFirst = idx === 0
  const isLast = idx === steps.length - 1

  // Pure validation gate for step 1 — no network here anymore.
  const validateInfo = (): boolean => {
    const { name, location, starts, ends } = useCampDraftStore.getState().info
    if (!name.trim() || !location.trim() || !starts || !ends) {
      setInfoError(c.required)
      return false
    }
    if (ends < starts) {
      setInfoError(c.dateError)
      return false
    }
    setInfoError(null)
    return true
  }

  const goNext = async () => {
    if (commit.isPending) return
    if (current === 'info' && !validateInfo()) return
    if (isLast) {
      // The one and only backend write. Resumable: a retry skips finished work.
      const campId = await commit.mutateAsync().catch(() => null)
      if (campId) onDone(campId)
      return
    }
    setIdx((i) => i + 1)
  }

  const goBack = () => {
    if (isFirst) {
      reset()
      onCancel()
      return
    }
    setIdx((i) => i - 1)
  }

  const jump = (key: WizardStepKey) => {
    const target = steps.indexOf(key)
    if (target <= idx) setIdx(target)
  }

  const finishLabel = commit.isPending ? w.creating : commit.isError ? w.retry : w.finish

  return (
    <div className="relative flex h-full flex-col bg-canvas">
      <header className="flex items-center gap-3 px-5 pt-4 md:px-8">
        <button
          type="button"
          onClick={goBack}
          aria-label={w.back}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-input border border-line bg-surface text-content active:scale-95"
        >
          ‹
        </button>
        <h1 className="text-subhead font-bold text-content">{w.title}</h1>
      </header>

      <Stepper steps={steps} current={current} onJump={jump} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-3 md:px-8">
        {current === 'info' && <InfoStep error={infoError} />}
        {current === 'groups' && <GroupsStep />}
        {current === 'organizers' && <OrganizersStep />}
        {current === 'participants' && <ParticipantsStep />}
        {current === 'review' && <ReviewStep />}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-5 pb-6 pt-4 md:px-8">
        {isLast && commit.isError && (
          <p role="alert" className="text-caption font-semibold text-danger">
            {commit.error instanceof Error ? commit.error.message : w.commitError}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex-none rounded-full border border-line bg-surface px-5 py-3.5 text-body font-semibold text-content active:scale-95"
          >
            {isFirst ? t.notfound.back : w.back}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={commit.isPending}
            className="flex-1 rounded-full bg-pine py-3.5 text-body font-bold text-white shadow-[0_8px_18px_rgba(15,107,79,0.28)] disabled:opacity-60 active:scale-95"
          >
            {isLast ? finishLabel : w.next}
          </button>
        </div>
      </div>
    </div>
  )
}
