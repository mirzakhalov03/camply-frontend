import { useEffect, useRef, type ReactNode } from 'react'

/*
  The one bottom sheet. Dimmed backdrop + a surface that slides up from the edge
  (reusing the shared `animate-sheet-up` keyframe), with the grab handle and an
  optional title/subtitle header. Replaces the hand-rolled `fixed inset-0`
  overlays in LanguageSheet, MemberSheet, SosSheet, etc. — so focus handling and
  Escape-to-close live in ONE place instead of being reinvented (or skipped) per
  sheet.

  A11y: role="dialog" + aria-modal, Escape closes, focus moves into the sheet on
  open and returns to the trigger on close, backdrop click closes.
*/
type Props = {
  open: boolean
  onClose: () => void
  /** Accessible label for the backdrop's close button. */
  closeLabel: string
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  /** Extra classes on the sheet surface (e.g. a max-height for long content). */
  className?: string
}

export function Sheet({
  open,
  onClose,
  closeLabel,
  title,
  subtitle,
  children,
  className = '',
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`animate-sheet-up absolute inset-x-0 bottom-0 rounded-t-card bg-surface-2 px-[18px] pb-7 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.22)] outline-none ${className}`}
      >
        <div className="mx-auto mb-4 mt-1.5 h-1 w-10 rounded-full bg-line" />
        {title && <div className="text-subhead font-bold text-content">{title}</div>}
        {subtitle && <div className="mb-4 mt-0.5 text-body text-muted">{subtitle}</div>}
        {children}
      </div>
    </div>
  )
}
