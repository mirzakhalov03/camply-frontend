import { Avatar } from '../../ui'
import { formatFileSize } from '../../../lib/formatFileSize'
import type { ChatMember, ChatMessage } from '../../../lib/chat'

/*
  One organizer-chat row — the same visual language as the participant MessageBubble
  (amber "me" bubble with ✓/✓✓, surface "them" bubble with a tappable avatar, system
  pill) but without the react/reply action bar the participant chat adds. Focused for
  the back-office thread; author identity + tap come from props.
*/
function Body({ message }: { message: ChatMessage }) {
  if (message.kind === 'image' && message.attachment) {
    return (
      <img
        src={message.attachment.url}
        alt={message.attachment.name}
        className="mb-1 max-h-56 w-full rounded-xl object-cover"
      />
    )
  }
  if (message.kind === 'file' && message.attachment) {
    return (
      <span className="mb-1 flex items-center gap-2">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-black/10 text-base">
          📎
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-semibold">{message.attachment.name}</span>
          {message.attachment.size ? (
            <span className="block text-[10px] opacity-70">
              {formatFileSize(message.attachment.size)}
            </span>
          ) : null}
        </span>
      </span>
    )
  }
  return <span>{message.text}</span>
}

export function OrgMessageBubble({
  message,
  author,
  onAuthorTap,
}: {
  message: ChatMessage
  author?: ChatMember
  onAuthorTap?: () => void
}) {
  if (message.kind === 'system') {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-soft px-3 py-1 text-[11px] font-semibold text-muted">
          {message.text}
        </span>
      </div>
    )
  }

  if (message.sentByMe) {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[78%] rounded-[18px_3px_18px_18px] bg-gradient-to-br from-[#f2ad42] to-amber px-3.5 pb-2 pt-2.5 text-body leading-snug text-amber-ink shadow-[0_4px_12px_rgba(224,152,42,0.3)]">
          <Body message={message} />
          <span className="mt-1 flex items-center justify-end gap-1 text-[9px] text-[rgba(58,40,7,0.55)]">
            {message.time}
            <span className={message.status === 'read' ? 'font-bold text-sky' : ''}>
              {message.status === 'read' ? '✓✓' : '✓'}
            </span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <button
        type="button"
        onClick={onAuthorTap}
        aria-label={author?.name}
        className="flex-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
      >
        <Avatar
          name={author?.name ?? ''}
          initials={author?.initials ?? '?'}
          photo={author?.photo}
          color={author?.color ?? 'var(--color-sky)'}
          size={32}
        />
      </button>
      <div className="flex max-w-[76%] flex-col items-start">
        <span className="mb-0.5 ml-1 text-[11px] font-bold" style={{ color: author?.color }}>
          {author?.name ?? '—'}
        </span>
        <div className="rounded-[3px_18px_18px_18px] bg-surface px-3.5 pb-2 pt-2.5 text-body leading-snug text-content shadow-[0_3px_10px_rgba(20,40,30,0.07)]">
          <Body message={message} />
          <span className="mt-1 block text-right text-[9px] text-muted">{message.time}</span>
        </div>
      </div>
    </div>
  )
}
