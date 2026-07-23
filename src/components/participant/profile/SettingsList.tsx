import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { LANG_LABELS } from '../../../i18n/translations'
import { LanguageSheet } from './LanguageSheet'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { SupportRow } from '../../ui'

/*
  Profile settings: language, location sharing, and notifications. Language opens
  a bottom-sheet picker. Location sharing is a visual toggle for now (its real
  behavior is a server-side privacy guardrail). Notifications is a REAL toggle —
  it subscribes/unsubscribes to Web Push via usePushNotifications().
*/
export function SettingsList() {
  const { t, lang, selectedLang, setLanguage } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const [locationOn, setLocationOn] = useState(true)
  const push = usePushNotifications()

  const pushBlocked = push.permission === 'denied'
  // Web Push on iOS only works from an installed PWA — hint to install first.
  const pushUnavailable = !push.supported || (!push.standalone && isIos())
  const pushHint = pushBlocked
    ? t.profile.notificationsBlocked
    : pushUnavailable
      ? t.profile.notificationsInstall
      : null

  const onTogglePush = () => {
    if (pushUnavailable || pushBlocked) return
    if (push.enabled) push.disable()
    else push.enable()
  }

  return (
    <>
      <div className="rounded-[20px] border border-line bg-surface px-[18px] shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        {/* Language — opens the picker sheet */}
        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className="flex w-full items-center gap-3 border-b border-line py-[14px] text-left"
        >
          <span className="w-[22px] text-base">🌐</span>
          <span className="flex-1 text-sm font-semibold text-content">{t.profile.language}</span>
          <span className="mr-2 text-[13px] font-semibold text-muted">{LANG_LABELS[lang]}</span>
          <Chevron />
        </button>

        {/* Location sharing — visual toggle (real behavior is a privacy guardrail) */}
        <div className="flex items-center gap-3 border-b border-line py-[14px]">
          <span className="w-[22px] text-base">📡</span>
          <span className="flex-1 text-sm font-semibold text-content">
            {t.profile.locationSharing}
          </span>
          <Switch
            on={locationOn}
            label={t.profile.locationSharing}
            onClick={() => setLocationOn((v) => !v)}
          />
        </div>

        {/* Notifications — REAL Web Push toggle */}
        <div className="border-b border-line py-[14px]">
          <div className="flex items-center gap-3">
            <span className="w-[22px] text-base">🔔</span>
            <span className="flex-1 text-sm font-semibold text-content">
              {t.profile.notifications}
            </span>
            <Switch
              on={push.enabled}
              disabled={pushUnavailable || pushBlocked}
              label={t.profile.notifications}
              onClick={onTogglePush}
            />
          </div>
          {pushHint && <p className="mt-1.5 pl-[34px] text-xs text-muted">{pushHint}</p>}
        </div>

        {/* Support — external Telegram link, last row (no bottom border) */}
        <SupportRow />
      </div>

      <LanguageSheet
        open={langOpen}
        selected={selectedLang}
        onSelect={setLanguage}
        onClose={() => setLangOpen(false)}
      />
    </>
  )
}

// iOS detection (Safari on iPhone/iPad) — used only to show the "install first" hint.
function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function Switch({
  on,
  onClick,
  label,
  disabled = false,
}: {
  on: boolean
  onClick: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${
        on ? 'bg-pine' : 'bg-line'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${
          on ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-line"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
