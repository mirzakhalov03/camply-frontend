type Props = {
  /** Uppercased initials, or '' before any name is typed. */
  initials: string
  /** Uploaded photo as a data URL, or null. Takes priority over initials. */
  photo: string | null
  /** Fires when the camper taps the avatar / "+" to pick a photo. */
  onUploadClick: () => void
  /** Accessible label for the upload action. */
  label: string
}

/*
  The live camp-badge avatar over the seam between the green hero and the paper
  sheet. It's a button: tapping anywhere (including the "+" corner) opens the
  photo picker. Priority is photo → initials → friendly person icon, so it always
  shows the most personal thing available as the camper fills the form.
*/
export function AvatarBadge({ initials, photo, onUploadClick, label }: Props) {
  return (
    <button
      type="button"
      onClick={onUploadClick}
      aria-label={label}
      className="relative rounded-[26px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
    >
      <div className="flex h-22 w-22 items-center justify-center overflow-hidden rounded-[26px] border-4 border-paper bg-gradient-to-br from-[#ef9d20] to-[#e0850c] shadow-[0_12px_28px_rgba(239,157,32,0.38)]">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : initials ? (
          <span className="font-display text-[32px] font-bold tracking-wide text-white">
            {initials}
          </span>
        ) : (
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="8.5" r="4" fill="#fff" opacity="0.92" />
            <path d="M4.5 20c0-4.2 3.4-6.5 7.5-6.5s7.5 2.3 7.5 6.5" fill="#fff" opacity="0.92" />
          </svg>
        )}
      </div>
      {/* "+" corner badge — the affordance to add a photo. */}
      <div className="absolute -bottom-1 -right-1 flex h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] border-paper bg-pine shadow-[0_3px_8px_rgba(15,107,79,0.3)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    </button>
  )
}
