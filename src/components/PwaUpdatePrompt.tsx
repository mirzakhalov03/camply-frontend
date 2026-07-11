import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from '../i18n/useTranslation'

/*
  Small toast that surfaces the two service-worker lifecycle moments: a new
  version is waiting (offer reload) or the app is now offline-ready. Rendered
  once near the app root. Tokens only — no raw hex — so it flips in dark mode.
*/
export function PwaUpdatePrompt() {
  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-card border border-line bg-surface p-4 shadow-lg">
      <p className="text-body text-content">
        {needRefresh ? t.pwa.updateReady : t.pwa.offlineReady}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        {needRefresh && (
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="rounded-input bg-pine px-3 py-1.5 text-caption font-semibold text-white"
          >
            {t.pwa.reload}
          </button>
        )}
        <button
          type="button"
          onClick={close}
          className="rounded-input px-3 py-1.5 text-caption font-semibold text-muted"
        >
          {t.pwa.dismiss}
        </button>
      </div>
    </div>
  )
}
