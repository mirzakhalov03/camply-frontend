/*
  Shared contracts for the reusable camp-creation wizard. Surface-agnostic: the org
  passes all five step keys, the organizer passes four (no 'organizers' — organizers
  cannot mint organizers, POST /organizers is org-only). The wizard creates a DRAFT
  camp on the info step and operates on that campId for every later step.
*/
export type WizardStepKey = 'info' | 'groups' | 'organizers' | 'participants' | 'review'

/** Step-1 form fields, kept in wizard state so revisiting the step PATCHes the camp. */
export type WizardDraft = {
  campId: string | null
  name: string
  location: string
  starts: string // YYYY-MM-DD (native date input)
  ends: string
  capacity: string
}

export type CampWizardProps = {
  /** Ordered steps for THIS surface. Org: all 5. Organizer: omit 'organizers'. */
  steps: WizardStepKey[]
  /** Called after the camp is published, with the real camp id (for navigation). */
  onDone: (campId: string) => void
  /** Called when the user backs out of step 1 (before a draft exists). */
  onCancel: () => void
}
