import { useEffect } from 'react'
import { useLanguageStore } from './useLanguageStore'
import { translations, DEFAULT_LANG, type Lang } from './translations'

/*
  The one hook screens use for language. It exposes:
  - `lang`         the language whose strings should render (falls back to the
                   default until the user manually picks one)
  - `selectedLang` the raw manual choice, or null — the welcome animation uses
                   this to decide whether to keep cycling
  - `t`            the string bundle for `lang`
  - `setLanguage`  make a manual choice
  It also keeps <html lang> in sync for accessibility.
*/
export function useTranslation() {
  const selectedLang = useLanguageStore((s) => s.selectedLang)
  const setLanguage = useLanguageStore((s) => s.setLanguage)

  const lang: Lang = selectedLang ?? DEFAULT_LANG

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return {
    lang,
    selectedLang,
    setLanguage,
    t: translations[lang],
  }
}
