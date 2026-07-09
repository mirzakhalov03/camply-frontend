import type { ReactNode } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'

type Props = {
  open: boolean
  onClose: () => void
  onPickPhoto: () => void
  onPickFile: () => void
  onPickCamera: () => void
}

/*
  Popover above the + button: Photo/Gallery, Attach file, Camera — attachments
  only, NOT "add people". Each row is a colored icon tile + label (matches the
  prototype). Choosing a row triggers a hidden <input type="file"> owned by the
  Composer (Camera uses `capture` to open the phone camera).

  Tile colors use tint TOKENS (not raw hex) so they flip correctly in dark mode.
*/
export function AttachmentMenu({ open, onClose, onPickPhoto, onPickFile, onPickCamera }: Props) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <>
      {/* Click-away backdrop */}
      <button
        type="button"
        aria-label={t.notfound.back}
        onClick={onClose}
        className="fixed inset-0 z-[40]"
      />
      <div className="absolute bottom-16 left-3 z-[41] w-52 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-[0_8px_24px_rgba(20,40,30,0.18)]">
        <Row
          onClick={onPickPhoto}
          label={t.chat.photo}
          tile="bg-sky-tint text-sky"
          icon={
            <>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </>
          }
        />
        <Row
          onClick={onPickFile}
          label={t.chat.file}
          tile="bg-amber-tint text-amber"
          icon={
            <>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </>
          }
        />
        <Row
          onClick={onPickCamera}
          label={t.chat.camera}
          tile="bg-green-tint text-pine"
          icon={
            <>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="3.5" />
            </>
          }
        />
      </div>
    </>
  )
}

// One menu row: a rounded colored tile holding the icon, plus its label.
function Row({
  onClick,
  label,
  tile,
  icon,
}: {
  onClick: () => void
  label: string
  tile: string // tile bg + icon color, e.g. 'bg-sky-tint text-sky'
  icon: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-body font-semibold text-content transition-colors active:bg-soft"
    >
      <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-[10px] ${tile}`}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      {label}
    </button>
  )
}
