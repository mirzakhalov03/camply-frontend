import { useQuery } from '@tanstack/react-query'
import { groupChatMock } from './mockChat'
// import { api } from './api' // ← enable when the backend endpoint exists

/*
  The DATA CONTRACT for the participant group chat. These shapes describe what
  the backend will serve: the group, its members, and the message history the
  organizer's roster + camp fill in. Components depend on these types, never on
  where the data comes from — mirroring lib/campHome.ts.
*/
export type ChatMember = {
  id: string
  name: string
  initials: string
  /** Avatar background — runtime data, applied as an inline style. */
  color: string
  city: string
  age: number
  role: 'leader' | 'member'
  online: boolean
  /** E.164 phone for the call button, e.g. '+998901234567'. */
  phone?: string
  /** True for the current participant. */
  isMe?: boolean
  socials?: {
    telegram?: string
    instagram?: string
    facebook?: string
    linkedin?: string
  }
}

export type ChatMessageKind = 'text' | 'image' | 'file' | 'system'

/** Delivery state for messages I send: one tick → two ticks (read). */
export type MessageStatus = 'sent' | 'read'

/*
  One emoji reaction on a message, aggregated the way the backend will return it:
  the emoji, how many people used it, and whether I'm one of them. That keeps the
  client from needing the full list of reactor ids to render a chip.
*/
export type MessageReaction = {
  emoji: string
  count: number
  mine: boolean
}

export type ChatMessage = {
  id: string
  /** Matches ChatMember.id; empty string for system messages. */
  authorId: string
  kind: ChatMessageKind
  text?: string
  attachment?: { name: string; url: string; size?: number }
  /** 'HH:MM' for display. */
  time: string
  /** True when the current participant is the author. */
  sentByMe: boolean
  /** Only meaningful for my own messages; drives the ✓ / ✓✓ indicator. */
  status?: MessageStatus
  /** Emoji reactions on this message. */
  reactions?: MessageReaction[]
  /** Snapshot of the message this one replies to (denormalized so it survives
      even if the original is later deleted). */
  replyTo?: { authorName: string; text: string }
}

export type GroupChat = {
  group: {
    name: string
    emoji: string
    /** Group photo URL (organizer-set later); falls back to the emoji tile. */
    photo?: string
    memberCount: number
    onlineCount: number
  }
  /** Pinned announcement text, if any. */
  pinned?: string
  members: ChatMember[]
  messages: ChatMessage[]
}

/*
  The single data boundary for the group chat. Returns the mock today; later this
  becomes `api.get<GroupChat>('/groups/current/chat')` and NOTHING in the UI
  changes. No component imports the mock directly — they all flow through here.
*/
export async function fetchGroupChat(): Promise<GroupChat> {
  // return api.get<GroupChat>('/groups/current/chat')
  return groupChatMock
}

// React Query hook. Cached by queryKey so header + list + composer share one fetch.
export function useChat() {
  return useQuery({ queryKey: ['groupChat'], queryFn: fetchGroupChat })
}
