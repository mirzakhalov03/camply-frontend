import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from './translations'

/*
  Language is CLIENT state (the UI owns it), so it lives in Zustand per the
  project convention — server data stays in React Query. `selectedLang === null`
  means the participant hasn't manually chosen yet, which is what lets the welcome
  headline keep auto-cycling until they pick. Persisted so the choice survives a
  reload / PWA relaunch.
*/
type LanguageState = {
  selectedLang: Lang | null
  setLanguage: (lang: Lang) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLang: null,
      setLanguage: (lang) => set({ selectedLang: lang }),
    }),
    { name: 'camply-lang' },
  ),
)
