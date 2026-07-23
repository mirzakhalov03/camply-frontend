/*
  The DATA CONTRACT for chat. These shapes describe what
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
  /** Avatar photo URL if the member has one; the avatar falls back to `initials`. */
  photo?: string
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
  /** ISO timestamp — used to compare against read markers for the ✓✓ status. */
  createdAt: string
  /** True when the current participant is the author. */
  sentByMe: boolean
  /** Only meaningful for my own messages; drives the ✓ / ✓✓ indicator. */
  status?: MessageStatus
  /** Emoji reactions on this message (server truth; always present, possibly empty). */
  reactions: MessageReaction[]
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
  The current participant's real identity, sourced from useProfileStore (what they
  entered at registration). The mock roster ships a PLACEHOLDER "me" member; this
  overlay replaces it with the user's actual name/photo/city so the chat shows the
  real person — not seed data. When the backend serves the roster it already knows
  who I am, so this overlay simply stops being applied.
*/
export type MeIdentity = {
  name: string
  initials: string
  photo: string | null
  city: string
  age: number
  socials?: ChatMember['socials']
}

/** Overlay my profile onto the `isMe` member; other members pass through. */
export function withMyProfile(members: ChatMember[], me: MeIdentity): ChatMember[] {
  if (!me.name) return members // not registered yet → keep the seed member
  return members.map((m) =>
    m.isMe
      ? {
          ...m,
          name: me.name,
          initials: me.initials || m.initials,
          photo: me.photo ?? undefined,
          city: me.city || m.city,
          age: me.age || m.age,
          socials: me.socials ?? m.socials,
        }
      : m,
  )
}
