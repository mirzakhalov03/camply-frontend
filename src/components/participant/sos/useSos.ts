import { useEffect, useRef, useState } from 'react'
import { sosContext, type SosReasonKey } from '@/lib/mocks/mockCamp'

/*
  The SOS state machine, lifted into a hook so the floating button and the sheet
  share one source of truth. Flow (mirrors the prototype exactly):

    reason ──hold to 100%──▶ sending ──1.6s──▶ active (ETA counts down)

  Press-and-hold guards against accidental alerts: holding fills a bar +5% every
  32ms (~640ms to fire); letting go early resets it. `holdRef` shadows the fill so
  the interval never reads a stale value from a closure.
*/
export type SosStage = 'reason' | 'sending' | 'active' | null

const HOLD_STEP = 5 // % added per tick
const HOLD_TICK_MS = 32 // → ~640ms to reach 100%
const SENDING_MS = 1600 // dramatic pause before "help on the way"

export function useSos() {
  const [stage, setStage] = useState<SosStage>(null)
  const [reason, setReason] = useState<SosReasonKey | null>(null)
  const [holdPct, setHoldPct] = useState(0)
  const [etaSec, setEtaSec] = useState(sosContext.responder.etaSeconds)
  const [helpActive, setHelpActive] = useState(false)

  const holdRef = useRef(0)
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const etaTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearTimers() {
    if (holdTimer.current) clearInterval(holdTimer.current)
    if (sendTimer.current) clearTimeout(sendTimer.current)
    if (etaTimer.current) clearInterval(etaTimer.current)
    holdTimer.current = sendTimer.current = etaTimer.current = null
  }

  // Stop every timer when the dashboard unmounts so nothing fires into the void.
  useEffect(() => () => clearTimers(), [])

  function open() {
    // If an alert is already live, reopening jumps straight to the tracking view.
    if (helpActive) {
      setStage('active')
      return
    }
    holdRef.current = 0
    setHoldPct(0)
    setReason(null)
    setStage('reason')
  }

  function close() {
    if (holdTimer.current) clearInterval(holdTimer.current)
    holdTimer.current = null
    // Keep the ETA ticking if help is still on the way; only the sheet closes.
    if (!helpActive) clearTimers()
    holdRef.current = 0
    setHoldPct(0)
    setStage(null)
  }

  function pickReason(key: SosReasonKey) {
    setReason((r) => (r === key ? null : key))
  }

  function holdStart() {
    if (holdTimer.current) clearInterval(holdTimer.current)
    holdTimer.current = setInterval(() => {
      holdRef.current = Math.min(100, holdRef.current + HOLD_STEP)
      setHoldPct(holdRef.current)
      if (holdRef.current >= 100) {
        if (holdTimer.current) clearInterval(holdTimer.current)
        holdTimer.current = null
        fire()
      }
    }, HOLD_TICK_MS)
  }

  function holdEnd() {
    if (holdTimer.current) clearInterval(holdTimer.current)
    holdTimer.current = null
    // Reset the bar only if it never completed.
    if (holdRef.current < 100) {
      holdRef.current = 0
      setHoldPct(0)
    }
  }

  function fire() {
    setStage('sending')
    setHoldPct(100)
    if (sendTimer.current) clearTimeout(sendTimer.current)
    sendTimer.current = setTimeout(() => {
      setHelpActive(true)
      setStage('active')
      setEtaSec(sosContext.responder.etaSeconds)
      if (etaTimer.current) clearInterval(etaTimer.current)
      etaTimer.current = setInterval(() => {
        setEtaSec((s) => {
          if (s <= 1) {
            if (etaTimer.current) clearInterval(etaTimer.current)
            etaTimer.current = null
            return 0
          }
          return s - 1
        })
      }, 1000)
    }, SENDING_MS)
  }

  function cancelHelp() {
    clearTimers()
    holdRef.current = 0
    setHoldPct(0)
    setHelpActive(false)
    setReason(null)
    setStage(null)
  }

  return {
    stage,
    reason,
    holdPct,
    etaSec,
    helpActive,
    open,
    close,
    pickReason,
    holdStart,
    holdEnd,
    cancelHelp,
  }
}

/** mm:ss for the ETA readout. */
export function formatEta(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
