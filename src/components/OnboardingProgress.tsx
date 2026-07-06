type Props = {
  /** Which step is active, 1-based (there are two onboarding steps). */
  step: 1 | 2
}

/*
  The two-pill progress indicator shown top-right during onboarding. Step 1 =
  the congratulations screen, step 2 = the profile sign-up. Sharing one component
  keeps the marker identical on both screens and lets the active pill advance as
  the camper slides forward. Decorative, so hidden from assistive tech.
*/
export function OnboardingProgress({ step }: Props) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <div
        className={`h-[5px] w-[22px] rounded-full ${step === 1 ? 'bg-[#ef9d20]' : 'bg-white/35'}`}
      />
      <div
        className={`h-[5px] w-[22px] rounded-full ${step === 2 ? 'bg-[#ef9d20]' : 'bg-white/35'}`}
      />
    </div>
  )
}
