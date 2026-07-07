import { useRef } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { useProfileStore } from '../../../store/useProfileStore'
import type { Membership } from '../../../lib/membership'

type Props = {
  /** Server-owned tribe/role/stats — the organizer's data, not the user's. */
  membership: Membership
}

/*
  The profile identity card: the green avatar (initials or photo) straddling the
  seam below the hero, the camper's name, tribe + role chips, and the stats row.
  Identity (name/photo) comes from the profile store; tribe/stats come in as a
  prop from the membership query. Tapping the camera badge changes the photo —
  reusing the same read-as-data-URL trick the registration form uses (no upload
  yet; that lands with the backend).
*/
export function IdentityCard({ membership }: Props) {
  const { t } = useTranslation()
  const name = useProfileStore((s) => s.name)
  const surname = useProfileStore((s) => s.surname)
  const photo = useProfileStore((s) => s.photo)
  const initials = useProfileStore((s) => s.initials)
  const setPhoto = useProfileStore((s) => s.setPhoto)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // let the same file be re-picked
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const fullName = [name, surname].filter(Boolean).join(' ')
  const { tribe, role, stats } = membership

  return (
    <div className="flex flex-col items-center rounded-[22px] border border-line bg-surface p-[18px] text-center shadow-[0_8px_22px_rgba(20,40,30,0.08)]">
      {/* Avatar overlaps the hero above it. Sized a touch larger than the card's
          other elements need, so the extra height rides UP into the hero (via the
          bigger negative margin) rather than pushing the name/stats down. */}
      <div className="relative -mt-[54px]">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />
        <div className="flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-gradient-to-br from-[#2f8f6b] to-pine text-[36px] font-bold text-white shadow-[0_6px_16px_rgba(15,107,79,0.3)]">
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : (
            initials || '🙂'
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={t.signup.uploadPhoto}
          className="absolute bottom-0 right-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] border-surface bg-amber"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
              stroke="#3a2807"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3.5" stroke="#3a2807" strokeWidth="2.2" />
          </svg>
        </button>
      </div>

      <div className="mt-3 text-[21px] font-bold tracking-tight text-content">{fullName}</div>

      <div className="mt-2 flex gap-[7px]">
        <span className="rounded-full bg-green-tint px-3 py-[5px] text-[11px] font-bold text-pine">
          {tribe.emoji} {tribe.name}
        </span>
        <span className="rounded-full bg-soft px-3 py-[5px] text-[11px] font-semibold text-muted">
          {t.profile.roles[role]}
        </span>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex w-full border-t border-line pt-[14px]">
        <Stat value={stats.groupRank} label={t.profile.groupRank} />
        <Stat value={stats.activities} label={t.profile.activities} bordered />
        <Stat value={stats.points} label={t.profile.points} accent />
      </div>
    </div>
  )
}

function Stat({
  value,
  label,
  bordered,
  accent,
}: {
  value: string | number
  label: string
  bordered?: boolean
  accent?: boolean
}) {
  return (
    <div className={`flex-1 ${bordered ? 'border-x border-line' : ''}`}>
      <div className={`text-[18px] font-extrabold ${accent ? 'text-amber' : 'text-content'}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  )
}
