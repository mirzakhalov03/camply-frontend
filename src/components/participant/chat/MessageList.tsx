import { useEffect, useMemo, useRef } from 'react'
import type { ChatMember, ChatMessage } from '../../../lib/chat'
import { useChatStore } from '../../../store/useChatStore'
import { MessageBubble } from './MessageBubble'

type Props = {
  campId: string
  /** The group room this thread belongs to (for reaction emits). */
  groupId: string | null
  members: ChatMember[]
  serverMessages: ChatMessage[]
  /** Open a member's profile sheet when their avatar/name is tapped. */
  onMemberTap: (member: ChatMember) => void
  /** Start a reply to a message. */
  onReply: (message: ChatMessage) => void
  emptyLabel: string
}

/*
  The scrollable thread. The rendered list is the room's cached history — sends and
  incoming messages both arrive as `chat:message` echoes appended to that cache (see
  realtimeBridge), so there's one source of truth. Reactions merge as a session
  overlay if present, else what the server sent. Auto-scrolls to the newest message.
*/
export function MessageList({
  campId,
  groupId,
  members,
  serverMessages,
  onMemberTap,
  onReply,
  emptyLabel,
}: Props) {
  const toggleReaction = useChatStore((s) => s.toggleReaction)
  const bottomRef = useRef<HTMLDivElement>(null)

  const byId = useMemo(() => {
    const map = new Map<string, ChatMember>()
    for (const m of members) map.set(m.id, m)
    return map
  }, [members])

  const all = serverMessages

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
        const reactions = m.reactions ?? []
        return (
          <MessageBubble
            key={m.id}
            message={m}
            author={author}
            onAuthorTap={author ? () => onMemberTap(author) : undefined}
            reactions={reactions}
            onToggleReaction={(emoji) => toggleReaction(campId, 'group', groupId, m.id, emoji)}
            onReply={() => onReply(m)}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
