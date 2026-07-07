import { useState, type ReactNode } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { useProfileStore, type Socials } from '../../../store/useProfileStore'

/*
  Social links card, mirroring the prototype's view↔edit toggle. Not collected at
  signup — the camper adds these here — so the whole card is editable and persists
  to the profile store. View mode shows a row of brand tiles: filled ones link out
  (new tab), empty ones are dimmed with a "+" that jumps into edit mode.
*/

type PlatformKey = keyof Socials

// Brand meta. Colors are brand identities (same in light/dark), so hardcoded —
// the exception to our semantic-token rule, same as the prototype.
const PLATFORMS: {
  key: PlatformKey
  tile: string // background classes for the square tile
  icon: (size: number) => ReactNode
}[] = [
  {
    key: 'telegram',
    tile: 'bg-[#229ED9]',
    icon: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff" aria-hidden>
        <path d="M21.5 4.3 2.9 11.5c-1 .4-1 1.4 0 1.7l4.7 1.5 1.8 5.6c.2.6.6.7 1.1.3l2.6-2 4.5 3.3c.6.4 1.3.1 1.5-.7l3-14.2c.2-.9-.4-1.3-1.1-.9z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    tile: 'bg-[linear-gradient(45deg,#f09433,#dc2743,#bc1888)]',
    icon: (s) => (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        aria-hidden
      >
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="#fff" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    tile: 'bg-[#1877F2]',
    icon: (s) => (
      <span
        style={{ fontSize: s * 1.3 }}
        className="font-serif font-extrabold leading-none text-white"
      >
        f
      </span>
    ),
  },
  {
    key: 'linkedin',
    tile: 'bg-[#0A66C2]',
    icon: (s) => (
      <span style={{ fontSize: s * 0.85 }} className="font-extrabold leading-none text-white">
        in
      </span>
    ),
  },
]

const PLACEHOLDER: Record<
  PlatformKey,
  'tgPlaceholder' | 'igPlaceholder' | 'fbPlaceholder' | 'liPlaceholder'
> = {
  telegram: 'tgPlaceholder',
  instagram: 'igPlaceholder',
  facebook: 'fbPlaceholder',
  linkedin: 'liPlaceholder',
}

const BASE: Record<PlatformKey, string> = {
  telegram: 'https://t.me/',
  instagram: 'https://instagram.com/',
  facebook: 'https://facebook.com/',
  linkedin: 'https://linkedin.com/in/',
}

// Turn whatever the camper typed (a handle, a t.me/… path, or a full URL) into a
// working link, so tapping a tile always opens the right profile.
function socialHref(key: PlatformKey, value: string): string {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v
  const handle = v
    .replace(/^@/, '')
    .replace(/^(t\.me\/|instagram\.com\/|facebook\.com\/|linkedin\.com\/(in\/)?)/i, '')
  return BASE[key] + handle
}

export function SocialLinks() {
  const { t } = useTranslation()
  const socials = useProfileStore((s) => s.socials)
  const setSocials = useProfileStore((s) => s.setSocials)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Socials>(socials)

  const enterEdit = () => {
    setDraft(socials)
    setEditing(true)
  }
  const save = () => {
    setSocials({
      telegram: draft.telegram.trim(),
      instagram: draft.instagram.trim(),
      facebook: draft.facebook.trim(),
      linkedin: draft.linkedin.trim(),
    })
    setEditing(false)
  }

  return (
    <div className="rounded-[20px] border border-line bg-surface p-[18px] shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
      <div className="mb-[14px] flex items-center justify-between">
        <div className="text-sm font-bold text-content">{t.profile.socialLinks}</div>
        <button
          type="button"
          onClick={editing ? save : enterEdit}
          className="text-xs font-bold text-pine"
        >
          {editing ? t.profile.save : t.profile.edit}
        </button>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2.5">
          {PLATFORMS.map(({ key, tile, icon }) => (
            <div key={key} className="flex items-center gap-2.5">
              <div
                className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${tile}`}
              >
                {icon(19)}
              </div>
              <input
                value={draft[key]}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                placeholder={t.profile[PLACEHOLDER[key]]}
                className="min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 py-[11px] text-[13px] text-content outline-none focus:border-pine"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={save}
            className="mt-0.5 flex h-11 items-center justify-center rounded-full bg-pine text-sm font-bold text-white shadow-[0_5px_13px_rgba(15,107,79,0.24)]"
          >
            {t.profile.saveLinks}
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-[13px]">
            {PLATFORMS.map(({ key, tile, icon }) => {
              const value = socials[key]
              if (value) {
                return (
                  <a
                    key={key}
                    href={socialHref(key, value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-[54px] w-[54px] items-center justify-center rounded-2xl ${tile} shadow-md`}
                  >
                    {icon(25)}
                  </a>
                )
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={enterEdit}
                  className="relative"
                  aria-label={`${t.profile.edit} — ${key}`}
                >
                  <div
                    className={`flex h-[54px] w-[54px] items-center justify-center rounded-2xl opacity-[0.26] ${tile}`}
                  >
                    {icon(25)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-sm text-muted shadow-sm">
                    +
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 text-xs text-muted">{t.profile.socialHint}</div>
        </>
      )}
    </div>
  )
}
