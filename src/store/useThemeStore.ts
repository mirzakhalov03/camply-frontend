import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/*
  Dark mode is CLIENT state (a UI preference), so it lives in Zustand like the
  language store. The actual theming is done in CSS: adding `.dark` to <html>
  makes every semantic token (--color-surface, --color-content…) flip to its
  night value (see index.css). Here we only track the choice and mirror it onto
  the document. Persisted so the theme survives a reload / PWA relaunch.
*/
type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

// Keep the <html> class in sync with the store value.
function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggle: () =>
        set((s) => {
          const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
          applyTheme(next)
          return { theme: next }
        }),
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'camply-theme',
      // Re-apply the persisted theme to <html> once it's rehydrated on load.
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
