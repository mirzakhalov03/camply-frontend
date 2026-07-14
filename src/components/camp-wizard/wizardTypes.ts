/*
  Shared contracts for the reusable camp-creation wizard. Surface-agnostic: the org
  passes all five step keys, the organizer passes four (no 'organizers' — organizers
  cannot mint organizers, POST /organizers is org-only). The wizard collects the
  whole draft in useCampDraftStore and commits it once, on Finish.
*/
export type WizardStepKey = 'info' | 'groups' | 'organizers' | 'participants' | 'review'

export type CampWizardProps = {
  /** Ordered steps for THIS surface. Org: all 5. Organizer: omit 'organizers'. */
  steps: WizardStepKey[]
  /** Called after the camp is committed + published, with the real camp id. */
  onDone: (campId: string) => void
  /** Called when the user backs out of step 1 (draft is reset). */
  onCancel: () => void
}
