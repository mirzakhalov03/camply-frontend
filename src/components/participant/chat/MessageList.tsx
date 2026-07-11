import { useEffect, useMemo, useRef } from 'react'
import type { ChatMember, ChatMessage } from '../../../lib/chat'
import { useChatStore } from '../../../store/useChatStore'
import { MessageBubble } from './MessageBubble'

type Props = {
  members: ChatMember[]
  serverMessages: ChatMessage[]
  /** Open a member's profile sheet when their avatar/name is tapped. */
  onMemberTap: (member: ChatMember) => void
  /** Start a reply to a message. */
  onReply: (message: ChatMessage) => void
  emptyLabel: string
}

/*
  The scrollable thread. The rendered list = server history + this-session sends
  (from useChatStore), server first. Reactions merge the same way: a message's
  displayed reactions are the session overlay if present, else what the server
  sent. Auto-scrolls to the newest message on mount and whenever the count changes.
*/
export function MessageList({ members, serverMessages, onMemberTap, onReply, emptyLabel }: Props) {
  const sent = useChatStore((s) => s.sent)
  const reactionOverrides = useChatStore((s) => s.reactionOverrides)
  const toggleReaction = useChatStore((s) => s.toggleReaction)
  const bottomRef = useRef<HTMLDivElement>(null)

  const byId = useMemo(() => {
    const map = new Map<string, ChatMember>()
    for (const m of members) map.set(m.id, m)
    return map
  }, [members])

  const all = useMemo(() => [...serverMessages, ...sent], [serverMessages, sent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [all.length])

  if (all.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center text-[13px] text-muted">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
      {all.map((m) => {
        const author = byId.get(m.authorId)
        const reactions = reactionOverrides[m.id] ?? m.reactions ?? []
        return (
          <MessageBubble
            key={m.id}
            message={m}
            author={author}
            onAuthorTap={author ? () => onMemberTap(author) : undefined}
            reactions={reactions}
            onToggleReaction={(emoji) => toggleReaction(m.id, emoji, reactions)}
            onReply={() => onReply(m)}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
