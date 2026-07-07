import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { LANG_LABELS } from '../../../i18n/translations'
import { LanguageSheet } from './LanguageSheet'

type Props = {
  /** Open the (not-yet-built) notifications screen. */
  onNotifications: () => void
}

/*
  Profile settings: notifications, language, and location sharing. Language opens
  a bottom-sheet picker (see LanguageSheet), wired to the real language store.
  Location sharing is a visual toggle for now — the REAL behavior is scoped to the
  camper's organizer/group during camp hours (a privacy guardrail), so we don't
  fake it here; this just holds the UI until that lands.
*/
export function SettingsList({ onNotifications }: Props) {
  const { t, lang, selectedLang, setLanguage } = useTranslation()
  const [langOpen, setLangOpen] = useState(false)
  const [locationOn, setLocationOn] = useState(true)

  return (
    <>
      <div className="rounded-[20px] border border-line bg-surface px-[18px] shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        {/* Notifications */}
        <button
          type="button"
          onClick={onNotifications}
          className="flex w-full items-center gap-3 border-b border-line py-[14px] text-left"
        >
          <span className="w-[22px] text-base">🔔</span>
          <span className="flex-1 text-sm font-semibold text-content">
            {t.profile.notifications}
          </span>
          <span className="mr-1.5 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-[#3a2807]">
            2
          </span>
          <Chevron />
        </button>

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

        {/* Location sharing — visual toggle (see note above) */}
        <div className="flex items-center gap-3 py-[14px]">
          <span className="w-[22px] text-base">📡</span>
          <span className="flex-1 text-sm font-semibold text-content">
            {t.profile.locationSharing}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={locationOn}
            aria-label={t.profile.locationSharing}
            onClick={() => setLocationOn((v) => !v)}
            className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${
              locationOn ? 'bg-pine' : 'bg-line'
            }`}
          >
            <span
              className={`absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${
                locationOn ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
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
