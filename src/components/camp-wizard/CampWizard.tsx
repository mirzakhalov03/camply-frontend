import { useCallback, useRef, useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { Stepper } from './Stepper'
import { InfoStep } from './steps/InfoStep'
import { GroupsStep } from './steps/GroupsStep'
import { OrganizersStep } from './steps/OrganizersStep'
import { ParticipantsStep } from './steps/ParticipantsStep'
import { ReviewStep } from './steps/ReviewStep'
import { usePublishCamp } from '../../api/queries/camps.queries'
import type { CampWizardProps, WizardDraft, WizardStepKey } from './wizardTypes'

const EMPTY: WizardDraft = {
  campId: null,
  name: '',
  location: '',
  starts: '',
  ends: '',
  capacity: '',
}

export function CampWizard({ steps, onDone, onCancel }: CampWizardProps) {
  const { t } = useTranslation()
  const w = t.campWizard
  const [idx, setIdx] = useState(0)
  const [draft, setDraft] = useState<WizardDraft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const publish = usePublishCamp()

  // InfoStep registers an async submit; other steps leave it null (advance freely).
  const submitRef = useRef<(() => Promise<boolean>) | null>(null)
  const registerSubmit = useCallback((fn: () => Promise<boolean>) => {
    submitRef.current = fn
  }, [])

  const current = steps[idx]
  const isFirst = idx === 0
  const isLast = idx === steps.length - 1

  const patchDraft = useCallback(
    (patch: Partial<WizardDraft>) => setDraft((d) => ({ ...d, ...patch })),
    [],
  )
  const onSaved = useCallback((campId: string) => setDraft((d) => ({ ...d, campId })), [])

  const goNext = async () => {
    if (busy) return
    // Run the step's registered submit (only InfoStep has one) before advancing.
    if (submitRef.current) {
      setBusy(true)
      const ok = await submitRef.current()
      setBusy(false)
      if (!ok) return
      submitRef.current = null
    }
    if (isLast) {
      if (!draft.campId) return
      setBusy(true)
      try {
        await publish.mutateAsync(draft.campId)
        onDone(draft.campId)
      } finally {
        setBusy(false)
      }
      return
    }
    setIdx((i) => i + 1)
  }

  const goBack = () => {
    if (isFirst) {
      onCancel()
      return
    }
    submitRef.current = null
    setIdx((i) => i - 1)
  }

  const jump = (key: WizardStepKey) => {
    const target = steps.indexOf(key)
    if (target <= idx) {
      submitRef.current = null
      setIdx(target)
    }
  }

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
        {current === 'info' && (
          <InfoStep
            draft={draft}
            onDraftChange={patchDraft}
            onSaved={onSaved}
            registerSubmit={registerSubmit}
          />
        )}
        {current === 'groups' && draft.campId && <GroupsStep campId={draft.campId} />}
        {current === 'organizers' && <OrganizersStep />}
        {current === 'participants' && draft.campId && <ParticipantsStep campId={draft.campId} />}
        {current === 'review' && draft.campId && <ReviewStep campId={draft.campId} />}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex gap-3 bg-gradient-to-t from-canvas via-canvas/90 to-transparent px-5 pb-6 pt-4 md:px-8">
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
          disabled={busy}
          className="flex-1 rounded-full bg-pine py-3.5 text-body font-bold text-white shadow-[0_8px_18px_rgba(15,107,79,0.28)] disabled:opacity-60 active:scale-95"
        >
          {isLast ? w.finish : w.next}
        </button>
      </div>
    </div>
  )
}
