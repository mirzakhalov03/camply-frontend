import { useTranslation } from '../../../i18n/useTranslation'
import { LANGUAGES, LANG_LABELS, LANG_NAMES, type Lang } from '../../../i18n/translations'

type Props = {
  open: boolean
  selected: Lang | null
  onSelect: (lang: Lang) => void
  onClose: () => void
}

// English name of each language — the card's secondary line (from the prototype).
const SUBTITLE: Record<Lang, string> = {
  uz: 'Uzbek',
  ru: 'Russian',
  en: 'English',
}

/*
  Language picker as a bottom sheet, matching the prototype: a dimmed backdrop,
  a sheet that slides up (reusing the shared `animate-sheet-up` keyframe), and one
  card per language — code badge, native name, English subtitle, and a check on
  the active one. Picking a language applies it immediately and closes the sheet.
  Profile-only for now, which is why it lives here rather than in the shared auth
  LanguageSwitcher.
*/
export function LanguageSheet({ open, selected, onSelect, onClose }: Props) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label={t.notfound.back}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      {/* Sheet */}
      <div className="animate-sheet-up absolute inset-x-0 bottom-0 rounded-t-[24px] bg-surface-2 px-[18px] pb-7 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.22)]">
        <div className="mx-auto mb-4 mt-1.5 h-1 w-10 rounded-full bg-line" />
        <div className="text-[17px] font-bold text-content">{t.profile.language}</div>
        <div className="mb-4 mt-0.5 text-[13px] text-muted">{t.profile.chooseLanguage}</div>

        <div className="flex flex-col gap-2.5">
          {LANGUAGES.map((lang) => {
            const active = selected === lang
            return (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  onSelect(lang)
                  onClose()
                }}
                className={`flex items-center gap-[13px] rounded-2xl border-[1.5px] p-[13px] text-left transition-colors ${
                  active ? 'border-pine bg-green-tint' : 'border-line bg-surface'
                }`}
              >
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-line bg-surface text-[13px] font-extrabold text-pine">
                  {LANG_LABELS[lang]}
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold text-content">
                    {LANG_NAMES[lang]}
                  </span>
                  <span className="block text-xs text-muted">{SUBTITLE[lang]}</span>
                </span>
                {active && (
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-pine">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
