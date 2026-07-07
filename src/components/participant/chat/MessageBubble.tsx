import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import type { ChatMessage, ChatMember, MessageReaction } from '../../../lib/chat'
import { formatFileSize } from '../../../lib/formatFileSize'

// Quick reactions offered when you tap someone's message.
const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '👏']

type Props = {
  message: ChatMessage
  /** The author, for other people's messages (drives name + avatar). */
  author?: ChatMember
  /** Open the author's profile sheet (avatar/name tap). */
  onAuthorTap?: () => void
  /** This message's reactions (server + this-session overlay, already merged). */
  reactions: MessageReaction[]
  /** Toggle my reaction with the given emoji. */
  onToggleReaction: (emoji: string) => void
  /** Start a reply to this message. */
  onReply: () => void
}

// Text, image, or file body — shared by both bubble sides.
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
          <span className="block truncate text-[13px] font-semibold">
            {message.attachment.name}
          </span>
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

// Quoted preview of the message being replied to, rendered inside a bubble.
function ReplyQuote({ replyTo }: { replyTo: NonNullable<ChatMessage['replyTo']> }) {
  return (
    <div className="mb-1.5 rounded-md border-l-2 border-black/25 bg-black/5 py-1 pl-2 pr-2">
      <div className="text-[10px] font-bold opacity-90">{replyTo.authorName}</div>
      <div className="line-clamp-1 text-[11px] opacity-75">{replyTo.text}</div>
    </div>
  )
}

// Reaction chips beneath a bubble. Tapping a chip toggles my reaction too.
function Reactions({
  reactions,
  onToggle,
  align,
}: {
  reactions: MessageReaction[]
  onToggle: (emoji: string) => void
  align: 'start' | 'end'
}) {
  if (reactions.length === 0) return null
  return (
    <div
      className={`mt-1 flex flex-wrap gap-1 ${align === 'end' ? 'justify-end' : 'justify-start'}`}
    >
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggle(r.emoji)}
          className={`flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            r.mine ? 'border-pine bg-green-tint text-pine' : 'border-line bg-surface text-muted'
          }`}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
    </div>
  )
}

/*
  One chat row. Three shapes:
    • system → centered pill (joins, group created)
    • sentByMe → amber gradient bubble, right-aligned, ✓ / ✓✓ read ticks
    • other → surface bubble, left-aligned, tappable avatar + name; tapping the
      bubble opens a react/reply action bar. Reactions & reply quotes render on
      both sides.
*/
export function MessageBubble({
  message,
  author,
  onAuthorTap,
  reactions,
  onToggleReaction,
  onReply,
}: Props) {
  const { t } = useTranslation()
  const [actionsOpen, setActionsOpen] = useState(false)

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
        <div className="max-w-[78%] rounded-[18px_3px_18px_18px] bg-gradient-to-br from-[#f2ad42] to-amber px-3.5 pb-2 pt-2.5 text-[13.5px] leading-snug text-[#3a2807] shadow-[0_4px_12px_rgba(224,152,42,0.3)]">
          {message.replyTo && <ReplyQuote replyTo={message.replyTo} />}
          <Body message={message} />
          <span className="mt-1 flex items-center justify-end gap-1 text-[9px] text-[rgba(58,40,7,0.55)]">
            {message.time}
            {/* ✓ = sent, ✓✓ = read (read ticks turn blue, like familiar chat apps). */}
            <span className={message.status === 'read' ? 'font-bold text-sky' : ''}>
              {message.status === 'read' ? '✓✓' : '✓'}
            </span>
          </span>
        </div>
        <Reactions reactions={reactions} onToggle={onToggleReaction} align="end" />
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <button
        type="button"
        onClick={onAuthorTap}
        aria-label={author?.name}
        className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full text-[11px] font-bold text-white"
        style={{ backgroundColor: author?.color ?? '#5aa9c4' }}
      >
        {author?.photo ? (
          <img src={author.photo} alt={author.name} className="h-full w-full object-cover" />
        ) : (
          (author?.initials ?? '?')
        )}
      </button>
      <div className="flex max-w-[76%] flex-col items-start">
        <button
          type="button"
          onClick={onAuthorTap}
          className="mb-0.5 ml-1 text-[11px] font-bold"
          style={{ color: author?.color }}
        >
          {author?.name ?? '—'}
        </button>

        <div className="relative">
          {/* React/reply action bar — appears when you tap the bubble. */}
          {actionsOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-1 flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 shadow-[0_6px_18px_rgba(20,40,30,0.18)]">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onToggleReaction(emoji)
                    setActionsOpen(false)
                  }}
                  className="text-base transition active:scale-125"
                >
                  {emoji}
                </button>
              ))}
              <span className="mx-0.5 h-4 w-px bg-line" />
              <button
                type="button"
                onClick={() => {
                  onReply()
                  setActionsOpen(false)
                }}
                className="flex items-center gap-1 px-1 text-[11px] font-semibold text-pine"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 17l-5-5 5-5" />
                  <path d="M4 12h11a5 5 0 0 1 5 5v1" />
                </svg>
                {t.chat.reply}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setActionsOpen((v) => !v)}
            className="block text-left"
          >
            <div className="rounded-[3px_18px_18px_18px] bg-surface px-3.5 pb-2 pt-2.5 text-[13.5px] leading-snug text-content shadow-[0_3px_10px_rgba(20,40,30,0.07)]">
              {message.replyTo && <ReplyQuote replyTo={message.replyTo} />}
              <Body message={message} />
              <span className="mt-1 block text-right text-[9px] text-muted">{message.time}</span>
            </div>
          </button>

          <Reactions reactions={reactions} onToggle={onToggleReaction} align="start" />
        </div>
      </div>
    </div>
  )
}
