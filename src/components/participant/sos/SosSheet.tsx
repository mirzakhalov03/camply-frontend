import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { sosReasons, sosContext, type SosReasonKey } from '../../../lib/mockCamp'
import { formatEta, type SosStage } from './useSos'

type Props = {
  stage: SosStage
  reason: SosReasonKey | null
  holdPct: number
  etaSec: number
  onClose: () => void
  onPickReason: (key: SosReasonKey) => void
  onHoldStart: () => void
  onHoldEnd: () => void
  onCancelHelp: () => void
}

/*
  The SOS bottom sheet. One component, three stages driven by `stage`:
    reason  → pick what's wrong + press-and-hold to confirm
    sending → radar "alerting…" beat
    active  → who's coming, ETA, live status, and "I'm safe now"
  Emergency reds are fixed across light/dark; the sheet chrome uses theme tokens.
*/
export function SosSheet({
  stage,
  reason,
  holdPct,
  etaSec,
  onClose,
  onPickReason,
  onHoldStart,
  onHoldEnd,
  onCancelHelp,
}: Props) {
  const { t } = useTranslation()
  if (stage === null) return null

  const reasonLabel = reason
    ? `${sosReasons.find((r) => r.key === reason)!.icon} ${t.sos.reasons[reason]}`
    : t.sos.reasonDefault

  return (
    <div className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-[rgba(40,10,6,0.5)]" onClick={onClose} />

      <div className="animate-sheet-up absolute inset-x-0 bottom-0 flex max-h-[94%] flex-col overflow-hidden rounded-t-[26px] bg-surface-2 shadow-[0_-12px_34px_rgba(0,0,0,0.28)]">
        {stage === 'reason' && (
          <ReasonStage
            reason={reason}
            holdPct={holdPct}
            onClose={onClose}
            onPickReason={onPickReason}
            onHoldStart={onHoldStart}
            onHoldEnd={onHoldEnd}
          />
        )}
        {stage === 'sending' && <SendingStage reasonLabel={reasonLabel} />}
        {stage === 'active' && (
          <ActiveStage
            reasonLabel={reasonLabel}
            etaSec={etaSec}
            onClose={onClose}
            onCancelHelp={onCancelHelp}
          />
        )}
      </div>
    </div>
  )
}

/* ── Stage 1: reason + press-and-hold ──────────────────────────────────── */
function ReasonStage({
  reason,
  holdPct,
  onClose,
  onPickReason,
  onHoldStart,
  onHoldEnd,
}: {
  reason: SosReasonKey | null
  holdPct: number
  onClose: () => void
  onPickReason: (key: SosReasonKey) => void
  onHoldStart: () => void
  onHoldEnd: () => void
}) {
  const { t } = useTranslation()
  const holding = holdPct > 0 && holdPct < 100

  return (
    <div className="overflow-y-auto px-5 pb-6 pt-2">
      <div className="mx-auto mb-4 mt-1.5 h-1 w-10 rounded-full bg-line" />

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-danger-tint text-[22px]">
          🆘
        </div>
        <div className="flex-1">
          <div className="font-display text-[19px] font-extrabold tracking-tight text-content">
            {t.sos.title}
          </div>
          <div className="text-[12.5px] text-muted">{t.sos.subtitle}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-soft text-lg text-muted"
        >
          ×
        </button>
      </div>

      <div className="mb-2.5 mt-4 text-[11px] font-bold uppercase tracking-wide text-[#b08b82]">
        {t.sos.whatsHappening}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {sosReasons.map((r) => {
          const on = reason === r.key
          return (
            <button
              type="button"
              key={r.key}
              onClick={() => onPickReason(r.key)}
              className={`rounded-[16px] border p-3.5 text-left transition ${
                on
                  ? 'border-danger-deep bg-danger-deep text-white'
                  : 'border-[#f0d9d2] bg-surface text-content'
              }`}
            >
              <div className="text-[22px] leading-none">{r.icon}</div>
              <div className="mt-2 text-sm font-bold">{t.sos.reasons[r.key]}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-3.5 flex flex-col gap-2.5 rounded-[16px] bg-soft p-3.5">
        <div className="flex items-center gap-2.5 text-[13px] text-content/85">
          <span className="text-[15px]">📍</span>
          <div className="flex-1">
            <span className="font-bold text-content">{sosContext.location}</span> ·{' '}
            {t.sos.locationSuffix}
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[13px] text-content/85">
          <span className="text-[15px]">📣</span>
          <div className="flex-1">
            {t.sos.alertsBefore} <span className="font-bold text-content">{sosContext.team}</span> +{' '}
            {t.sos.alertsLeader}{' '}
            <span className="font-bold text-content">{sosContext.leaderName}</span>
          </div>
        </div>
      </div>

      {/* Press-and-hold to confirm. */}
      <div
        onPointerDown={onHoldStart}
        onPointerUp={onHoldEnd}
        onPointerLeave={onHoldEnd}
        onPointerCancel={onHoldEnd}
        className="relative mt-4 h-[58px] cursor-pointer touch-none select-none overflow-hidden rounded-full bg-[#f0d9d2] shadow-[0_8px_20px_rgba(224,73,47,0.26)]"
      >
        <div
          className="absolute inset-y-0 left-0 bg-[linear-gradient(135deg,var(--color-danger),var(--color-danger-deep))] transition-[width] duration-[50ms] ease-linear"
          style={{ width: `${holdPct}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-base font-extrabold text-[#7a2414]">
          🆘 {holding ? t.sos.keepHolding : t.sos.holdToSend}
        </div>
      </div>
      <p className="mt-2.5 text-center text-xs text-[#a08279]">{t.sos.holdHint}</p>
    </div>
  )
}

/* ── Stage 2: sending ──────────────────────────────────────────────────── */
function SendingStage({ reasonLabel }: { reasonLabel: string }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center px-6 pb-12 pt-10 text-center">
      <div className="relative flex h-[110px] w-[110px] items-center justify-center">
        <span className="animate-radar absolute inset-0 rounded-full bg-[rgba(224,73,47,0.4)]" />
        <span className="animate-radar absolute inset-0 rounded-full bg-[rgba(224,73,47,0.4)] [animation-delay:0.8s]" />
        <div className="relative flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[linear-gradient(150deg,var(--color-danger),var(--color-danger-deep))] text-3xl shadow-[0_10px_24px_rgba(224,73,47,0.4)]">
          🆘
        </div>
      </div>
      <div className="mt-7 text-[19px] font-extrabold text-content">{t.sos.sendingTitle}</div>
      <div className="mt-1.5 text-[13px] text-muted">
        {interpolate(t.sos.sendingSub, { reason: reasonLabel })}
      </div>
    </div>
  )
}

/* ── Stage 3: active tracking ──────────────────────────────────────────── */
function ActiveStage({
  reasonLabel,
  etaSec,
  onClose,
  onCancelHelp,
}: {
  reasonLabel: string
  etaSec: number
  onClose: () => void
  onCancelHelp: () => void
}) {
  const { t } = useTranslation()
  const { responder, location, team, leaderName } = sosContext

  return (
    <div className="overflow-y-auto">
      <div className="relative bg-[linear-gradient(140deg,var(--color-danger),var(--color-danger-deep))] px-5 pb-6 pt-5 text-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-3.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/20 text-lg"
        >
          ×
        </button>
        <div className="flex w-max items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide">
          <span className="animate-livedot h-[7px] w-[7px] rounded-full bg-white" />
          {t.sos.helpOnWay}
        </div>
        <div className="mt-3 font-display text-[22px] font-extrabold tracking-tight">
          {t.sos.stayPut}
        </div>
        <div className="mt-1 text-[13px] text-white/85">
          {interpolate(t.sos.activeSub, { reason: reasonLabel, location })}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-6 pt-4">
        {/* Responder + ETA */}
        <div className="flex items-center gap-3 rounded-[18px] border border-line bg-surface p-4 shadow-[0_4px_14px_rgba(20,40,30,0.06)]">
          <div className="flex h-[50px] w-[50px] flex-none items-center justify-center rounded-full bg-[linear-gradient(145deg,#e0982a,#c27e1c)] text-base font-bold text-white">
            {responder.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-content">{responder.name}</div>
            <div className="text-xs text-muted">{t.sos.responderRole}</div>
          </div>
          <div className="flex-none text-right">
            <div className="font-mono text-[19px] font-bold text-pine">{formatEta(etaSec)}</div>
            <div className="text-[10px] text-muted">{t.sos.eta}</div>
          </div>
        </div>

        {/* Live status checklist */}
        <div className="rounded-[18px] border border-line bg-surface px-4 shadow-[0_4px_14px_rgba(20,40,30,0.06)]">
          <StatusRow done label={interpolate(t.sos.teamNotified, { team })} trailing={t.sos.now} />
          <StatusRow
            done
            label={interpolate(t.sos.leaderAlerted, { leader: leaderName })}
            trailing={t.sos.now}
          />
          <StatusRow label={t.sos.sharingLocation} last />
        </div>

        <button
          type="button"
          className="flex h-[50px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-danger),var(--color-danger-deep))] text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(224,73,47,0.3)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
            <path d="M20 15.5a11 11 0 0 1-3.5-.6 1 1 0 0 0-1 .25l-1.5 1.5a13 13 0 0 1-6-6l1.5-1.5a1 1 0 0 0 .25-1A11 11 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1 17 17 0 0 0 17 17 1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z" />
          </svg>
          {t.sos.callOrganizer}
        </button>
        <button
          type="button"
          onClick={onCancelHelp}
          className="flex h-12 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#cfe0d7] bg-surface text-sm font-bold text-pine"
        >
          ✓ {t.sos.imSafe}
        </button>
      </div>
    </div>
  )
}

function StatusRow({
  label,
  done,
  trailing,
  last,
}: {
  label: string
  done?: boolean
  trailing?: string
  last?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 py-3 ${last ? '' : 'border-b border-line'}`}>
      {done ? (
        <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-green-tint text-[13px] font-extrabold text-pine">
          ✓
        </span>
      ) : (
        <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-amber-tint text-xs">
          📍
        </span>
      )}
      <div className="flex-1 text-[13px] font-semibold text-content">{label}</div>
      {trailing ? (
        <span className="text-[11px] text-muted">{trailing}</span>
      ) : (
        <span className="animate-livedot h-2 w-2 flex-none rounded-full bg-[#0f8a5b]" />
      )}
    </div>
  )
}
