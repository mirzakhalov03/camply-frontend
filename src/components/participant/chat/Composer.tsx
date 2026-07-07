import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { AttachmentMenu } from './AttachmentMenu'

type Props = {
  groupName: string
  onSendText: (text: string) => void
  onPickFile: (file: File) => void
  /** When replying, the quoted message shown above the input; null otherwise. */
  replyPreview: { authorName: string; text: string } | null
  onCancelReply: () => void
}

/*
  Bottom input bar. Left "+" opens the attachment menu (Photo/File) → a hidden
  file input → onPickFile. The text field + send button push a text message.
  Enter sends; empty messages are ignored (guarded in the store too). When a reply
  is active, a quoted preview sits above the input and the field auto-focuses.
*/
export function Composer({
  groupName,
  onSendText,
  onPickFile,
  replyPreview,
  onCancelReply,
}: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const textInput = useRef<HTMLInputElement>(null)

  // Focus the field the moment a reply starts, so you can type right away.
  // Depend on a boolean (not the replyPreview object, which is a fresh reference
  // every render) so unrelated re-renders don't keep stealing focus.
  const replyActive = replyPreview !== null
  useEffect(() => {
    if (replyActive) textInput.current?.focus()
  }, [replyActive])

  const submit = () => {
    if (!text.trim()) return
    onSendText(text)
    setText('')
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onPickFile(file)
    e.target.value = '' // allow re-picking the same file
    setMenuOpen(false)
  }

  return (
    <div className="relative flex-none border-t border-line bg-surface-2 px-3 pb-6 pt-2.5">
      <AttachmentMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onPickPhoto={() => photoInput.current?.click()}
        onPickFile={() => fileInput.current?.click()}
      />

      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-hidden
      />
      <input ref={fileInput} type="file" onChange={handleFile} className="hidden" aria-hidden />

      {replyPreview && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-pine bg-soft px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-pine">{replyPreview.authorName}</div>
            <div className="truncate text-[12px] text-muted">{replyPreview.text}</div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label={t.notfound.back}
            className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-muted"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={t.chat.attach}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-soft text-pine transition active:scale-95"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <input
          ref={textInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={interpolate(t.chat.messagePlaceholder, { group: groupName })}
          className="h-10 flex-1 rounded-full border border-line bg-canvas px-4 text-[13px] text-content placeholder:text-muted focus:outline-none"
        />

        <button
          type="button"
          onClick={submit}
          aria-label={t.chat.send}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gradient-to-br from-pine to-deep shadow-[0_4px_10px_rgba(15,107,79,0.3)] transition active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M3 11l18-8-8 18-2-7-8-3z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
