import { useTranslation } from '../../../i18n/useTranslation'

type Props = {
  /** True once an alert is live — the card flips to the "notified" state. */
  helpActive: boolean
  /** Open the SOS sheet (same sheet the floating button opens). */
  onOpen: () => void
  /** Stand down an active alert. */
  onCancel: () => void
}

/*
  The profile's "Need help?" card — a calm, always-reachable second entry point to
  SOS (the floating red button is the primary one). It shares the single useSos
  state via props, so this card and the button/sheet never disagree: if an alert
  is live, this shows "Organizer notified" with a cancel; otherwise it invites the
  camper to send one.
*/
export function SosCard({ helpActive, onOpen, onCancel }: Props) {
  const { t } = useTranslation()

  if (helpActive) {
    return (
      <div className="rounded-[20px] border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[13px] bg-[#e0492f]/12 text-xl">
            🆘
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-content">{t.profile.organizerNotified}</div>
            <div className="text-xs text-muted">{t.profile.organizerNotifiedBody}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 flex h-[42px] w-full items-center justify-center rounded-full border border-line bg-canvas text-[13px] font-bold text-muted transition active:scale-[0.99]"
        >
          {t.profile.cancelAlert}
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-[20px] border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.05)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[13px] bg-amber-tint text-xl">
          🛟
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-content">{t.profile.needHelp}</div>
          <div className="text-xs text-muted">{t.profile.needHelpBody}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex h-[46px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#e0492f] to-[#c43a22] text-[15px] font-bold text-white shadow-[0_6px_16px_rgba(224,73,47,0.3)] transition active:scale-[0.99]"
      >
        🆘 {t.profile.sendHelp}
      </button>
    </div>
  )
}
