import { useEffect, useRef } from 'react'
import { useLanguageStore } from '@/i18n/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { axiosInstance } from '@/api/axiosInstance'

/*
  Pushes the client's chosen UI language to the server (PATCH /auth/me/language) so
  push notifications can be rendered in it. Fires when authenticated and the choice
  changes. Fire-and-forget — a failed sync just means push falls back to 'uz'.
*/
export function useLanguageSync() {
  const lang = useLanguageStore((s) => s.selectedLang)
  const userId = useAuthStore((s) => s.user?.id)
  const lastSynced = useRef<string | null>(null)

  useEffect(() => {
    if (!userId || !lang) return
    if (lastSynced.current === lang) return
    lastSynced.current = lang
    void axiosInstance.patch('/auth/me/language', { language: lang })
  }, [userId, lang])
}
