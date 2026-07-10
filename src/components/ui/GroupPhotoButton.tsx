import { useRef } from 'react'

type Props = {
  /** Uploaded photo URL, or null to show the emoji fallback. */
  photo: string | null | undefined
  /** Emoji shown when there's no photo. */
  emoji: string
  /** Alt text for the image + aria-label for the upload button. */
  label: string
  /** Provide to make the tile an uploader (adds the "+" badge + file picker).
      Omit for a read-only identity tile. */
  onPick?: (file: File) => void
  className?: string
}

/*
  The group-identity photo tile, shared by the participant chat header and the
  organizer chat header so the two can't drift. Shows the uploaded photo or an
  emoji fallback on a pine-gradient tile. With `onPick` it becomes an uploader —
  a pine "+" corner badge over a hidden <input type=file>; without it, a static
  tile (e.g. the organizers channel, which keeps its emoji).
*/
export function GroupPhotoButton({ photo, emoji, label, onPick, className = '' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const tile = (
    <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-input bg-gradient-to-br from-pine-light to-pine text-[22px] shadow-[0_4px_10px_rgba(15,107,79,0.25)]">
      {photo ? <img src={photo} alt={label} className="h-full w-full object-cover" /> : emoji}
    </span>
  )

  // Read-only: just the tile, no upload affordance.
  if (!onPick) {
    return <span className={`flex-none ${className}`}>{tile}</span>
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onPick(file)
    e.target.value = '' // allow re-picking the same file
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={label}
        className={`relative flex-none rounded-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine ${className}`}
      >
        {tile}
        <span className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-surface-2 bg-pine shadow-[0_2px_6px_rgba(15,107,79,0.35)]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        aria-hidden
      />
    </>
  )
}
