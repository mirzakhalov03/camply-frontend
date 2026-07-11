# Participant Group Chat — Design

**Date:** 2026-07-07
**Surface:** Participant app (mobile-first PWA)
**Status:** Approved, ready for implementation plan

## Goal

Build the participant **group chat** — the "Chat" bottom-nav tab, currently a
`ComingSoon` stub. A camper opens it and sees their group's conversation: a
header with the group and who's online, a pinned message, the message thread,
and a composer to send messages and attach photos/files. Tapping a groupmate
opens their profile.

The build is **frontend-only** but architected so that adding a backend later
(which will store the messages) requires swapping one data function, not
rewriting the UI. We follow the existing `campHome.ts` seam pattern exactly.

Not a clone of the prototype — same spirit, cleaner architecture, our design
tokens (dark-mode safe), and two deliberate changes requested by the product
owner (see Decisions).

## Decisions

1. **Fully interactive locally.** The user can type and send; messages appear
   instantly. Sent messages live in a Zustand store shaped like the future API,
   so "send" becomes one `POST` later with no UI change.
2. **Member profile = bottom sheet peek.** Reuses the sheet language already in
   the app (SOS sheet). Stays in context; dismiss on tap-outside.
3. **Attachments = real picker + local preview.** The bottom-left `+` opens a
   Photo/File menu → native file picker → the file renders as a real bubble via a
   local object URL. The actual upload call slots in later.
4. **The `+` is attachments only — never "add people."** Participants cannot
   alter their own roster (that is an organizer action). This intentionally drops
   the prototype's "Add to chat" pool.

## Architecture

Mirrors the app's existing split between **server-owned data** (React Query over
a mock behind a TypeScript contract) and **user client action** (Zustand).

```
src/lib/
  chat.ts          DATA CONTRACT + useChat() hook — the seam; today reads mock
  mockChat.ts      the only hardcoded chat content (members, seeded messages)
src/store/
  useChatStore.ts  messages the user sends this session (optimistic, local)
src/components/participant/chat/
  ChatScreen.tsx        the tab; composes everything, owns sheet + attachment state
  ChatHeader.tsx        group avatar, name, "N members · M online", online rail
  MessageList.tsx       scrollable bubbles; auto-scrolls to newest
  MessageBubble.tsx     one bubble; text / image / file / system variants
  PinnedBar.tsx         amber pinned message
  Composer.tsx          input bar: + (attach), text field, send
  AttachmentMenu.tsx    Photo / File popover → hidden <input type="file">
  MemberSheet.tsx       bottom sheet: a groupmate's profile
```

### Data contract (`chat.ts`)

```ts
export type ChatMember = {
  id: string
  name: string
  initials: string
  color: string          // avatar background (runtime value → inline style)
  city: string
  age: number
  role: 'leader' | 'member'
  online: boolean
  isMe?: boolean
  socials?: { telegram?: string; instagram?: string; facebook?: string; linkedin?: string }
}

export type ChatMessageKind = 'text' | 'image' | 'file' | 'system'

export type ChatMessage = {
  id: string
  authorId: string       // matches ChatMember.id; '' for system
  kind: ChatMessageKind
  text?: string
  attachment?: { name: string; url: string; size?: number }
  time: string           // 'HH:MM' for display
  sentByMe: boolean
}

export type GroupChat = {
  group: { name: string; emoji: string; memberCount: number; onlineCount: number }
  pinned?: string
  members: ChatMember[]
  messages: ChatMessage[]
}
```

`useChat()` = `useQuery` reading `fetchGroupChat()`, which today returns the mock
and later becomes `api.get<GroupChat>('/groups/current/chat')`.

### Merge model

The rendered thread = **server `messages`** (from `useChat()`) **+** **local
sent `messages`** (from `useChatStore`), merged in time order. Server history
stays server-owned; this-session sends feel instant and persist across tab
switches. When the backend lands, the store's `send` also fires the mutation and
the optimistic message reconciles with the server echo.

### `useChatStore` (Zustand)

```ts
{
  sent: ChatMessage[]
  sendText: (text: string) => void
  sendAttachment: (file: File) => void   // creates object URL, kind image|file
  reset: () => void
}
```

"Me" identity (name, initials, color) comes from `useProfileStore`, consistent
with how the rest of the app treats the current user.

## UX

- **Chat tab** renders `ChatScreen` instead of `ComingSoon`.
- **Header:** group emoji + name, "N members · M online", and a horizontal
  online rail of member avatars (online dot). Tapping the rail area or a member
  avatar opens that member's sheet.
- **Pinned bar:** amber, shows the pinned announcement text when present.
- **Thread:** system messages = centered pill; others = surface bubble,
  left-aligned, with name + avatar; me = amber-gradient bubble, right-aligned,
  static `✓✓`. Auto-scroll to newest on mount and on send.
- **Tap a groupmate** (rail avatar or a bubble's avatar/name) → **member sheet**:
  large avatar, name, city · age, role badge (★ Leader / You), socials. Tapping
  "me" opens the user's own card.
- **Composer:** `+` opens Photo/File menu → native picker → preview bubble;
  text field + send → amber bubble appears instantly.

## Guardrails honored

- **Trilingual:** all copy via `useTranslation()`; a new `chat` block added to
  `translations.ts` in EN / UZ / RU. No hardcoded strings.
- **Dark mode:** semantic Tailwind tokens (`bg-surface`, `text-pine`,
  `border-line`, `text-muted`…), never raw hex.
- **Design system:** DM Sans/Mono, ~16px radii, soft shadows, pine/amber palette.
- **Accessibility:** real `<button>`s, adequate tap targets, labeled file input,
  focus-friendly sheet.

## Out of scope (YAGNI now, slots in behind the same contract later)

Reactions, dynamic read receipts, typing indicators, edit/delete, real upload,
message search, unread-divider logic. The `✓✓` is static.

## Testing / verification

No test runner is configured in the frontend yet. Verification is manual against
the running dev server (per the "Camply phone preview" memory): open the Chat
tab, send a text message (appears instantly), attach an image (preview bubble),
tap a groupmate (sheet with their info), toggle dark mode (tokens hold), and
switch language (all chat copy translates). Typecheck + lint via
`npm run validate` must pass.
