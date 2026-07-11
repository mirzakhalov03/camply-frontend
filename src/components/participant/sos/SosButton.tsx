import { useTranslation } from '../../../i18n/useTranslation'

type Props = {
  /** True while an alert is live — the button becomes a "Help coming" pill. */
  helpActive: boolean
  onOpen: () => void
}

/*
  The persistent SOS button, floating above the tab bar on every participant
  screen. Idle: a breathing red circle. Active: a pulsing "Help coming" pill so
  the state stays visible while help is on the way. Red is fixed in both themes —
  emergency shouldn't re-color.
*/
export function SosButton({ helpActive, onOpen }: Props) {
  const { t } = useTranslation()

  return (
    <div className="absolute bottom-24 right-4 z-40">
      {helpActive ? (
        <button
          type="button"
          onClick={onOpen}
          className="animate-sos-breath flex items-center gap-2 rounded-full bg-danger-deep py-2 pl-2.5 pr-4 text-white"
        >
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/20 text-sm">
            🆘
          </span>
          <span className="text-body font-extrabold tracking-wide">{t.sos.helpComing}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          aria-label="SOS — emergency help"
          className="animate-sos-idle flex h-[58px] w-[58px] items-center justify-center rounded-full border-[2.5px] border-white/75 bg-[linear-gradient(150deg,var(--color-danger),var(--color-danger-deep))] text-white shadow-[0_8px_20px_rgba(224,73,47,0.4)]"
        >
          <span className="text-title font-black tracking-wide">SOS</span>
        </button>
      )}
    </div>
  )
}
