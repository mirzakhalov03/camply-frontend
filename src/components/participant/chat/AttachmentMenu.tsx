import { useTranslation } from '../../../i18n/useTranslation'

type Props = {
  open: boolean
  onClose: () => void
  onPickPhoto: () => void
  onPickFile: () => void
}

/*
  Small popover above the + button: Photo / File. NOT "add people" — attachments
  only. Each choice triggers a hidden <input type="file"> owned by the Composer.
*/
export function AttachmentMenu({ open, onClose, onPickPhoto, onPickFile }: Props) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label={t.notfound.back}
        onClick={onClose}
        className="fixed inset-0 z-[40]"
      />
      <div className="absolute bottom-16 left-3 z-[41] w-40 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_24px_rgba(20,40,30,0.18)]">
        <button
          type="button"
          onClick={onPickPhoto}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-semibold text-content transition-colors active:bg-soft"
        >
          <span className="text-base">🖼️</span>
          {t.chat.photo}
        </button>
        <div className="h-px bg-line" />
        <button
          type="button"
          onClick={onPickFile}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-semibold text-content transition-colors active:bg-soft"
        >
          <span className="text-base">📎</span>
          {t.chat.file}
        </button>
      </div>
    </>
  )
}
