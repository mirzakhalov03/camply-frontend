import { interpolate } from '@/utils/interpolate'

type Props = {
  initials: string
  /** Uploaded photo as a data URL, or null. Shown on the badge if present. */
  photo: string | null
  name: string
  /** Small confirmation pill, e.g. "Profile created". */
  badgeCreated: string
  /** Headline template with a {name} token, e.g. "Welcome to camp, {name}!". */
  welcome: string
  /** Primary CTA label (e.g. "Enter the camp" / "Go to dashboard"). */
  primaryLabel: string
  onPrimary?: () => void
  /** Secondary "edit" link label. */
  editLabel: string
  onEdit: () => void
}

/*
  Full-screen confirmation shown after a valid profile is submitted. Celebrates
  the created badge (photo or initials on the amber square), greets the person by
  name, and offers the primary next step plus a way back to edit. Sits on the
  same deep-green gradient as the other result screens for continuity.

  Shared by the participant (SignUpScreen) and organizer (OrganizerInfoForm)
  flows — only the copy and the primary action differ, so they're props.
*/
export function ProfileSuccess({
  initials,
  photo,
  name,
  badgeCreated,
  welcome,
  primaryLabel,
  onPrimary,
  editLabel,
  onEdit,
}: Props) {
  return (
    <div className="animate-rise-in absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#0f6b4f_0%,#0a5039_100%)] px-8 text-white">
      <div className="relative flex flex-col items-center">
        <div className="animate-pop-in flex h-26 w-26 items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-[#ef9d20] to-[#e0850c] shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-[38px] font-bold text-white">{initials}</span>
          )}
        </div>

        <div className="mt-6 inline-flex items-center gap-[7px] rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M4 9.5l3 3 7-7.5"
              stroke="#f4d9a8"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {badgeCreated}
        </div>

        <h2 className="mt-4 text-center font-display text-[26px] font-bold leading-tight tracking-tight">
          {interpolate(welcome, { name })}
        </h2>

        <button
          type="button"
          onClick={onPrimary}
          className="animate-amber-glow mt-7 flex h-[54px] items-center justify-center rounded-full bg-[#ef9d20] px-10 font-display text-base font-bold text-[#3a2807] transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="mt-4 text-[13px] font-medium text-white/70 transition-colors hover:text-white"
        >
          {editLabel}
        </button>
      </div>
    </div>
  )
}
