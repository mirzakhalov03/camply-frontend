import { LANGUAGES, LANG_LABELS, LANG_NAMES, type Lang } from '../../i18n/translations'

type Props = {
  /** The manually chosen language, or null if the user hasn't picked yet. */
  selected: Lang | null
  onSelect: (lang: Lang) => void
  label: string
}

/*
  Compact segmented toggle: UZ · RU · EN. Nothing is highlighted until the
  participant picks a language (selected === null) — that's the visual cue that
  the welcome headline is still cycling.
*/
export function LanguageSwitcher({ selected, onSelect, label }: Props) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-full border border-ink/10 bg-white/70 p-0.5 shadow-sm backdrop-blur-sm"
    >
      {LANGUAGES.map((lang) => {
        const active = selected === lang
        return (
          <button
            key={lang}
            type="button"
            onClick={() => onSelect(lang)}
            aria-pressed={active}
            aria-label={LANG_NAMES[lang]}
            className={[
              'min-w-9 rounded-full px-2.5 py-1 font-mono text-xs font-medium tracking-wide transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber',
              active
                ? 'bg-pine text-paper shadow-sm'
                : 'text-ink/60 hover:text-ink hover:bg-black/5',
            ].join(' ')}
          >
            {LANG_LABELS[lang]}
          </button>
        )
      })}
    </div>
  )
}
