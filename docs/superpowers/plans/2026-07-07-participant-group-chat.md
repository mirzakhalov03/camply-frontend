# Participant Group Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the participant "Chat" tab (currently a `ComingSoon` stub) into a real, interactive group chat — header with online rail, pinned message, message thread, a composer that sends text and attaches photos/files, and a tap-a-groupmate profile sheet.

**Architecture:** Follow the existing `campHome.ts` data-seam pattern. Server-owned data (group, members, message history) comes from a `useChat()` React Query hook reading a mock behind a TypeScript contract. Messages the user sends this session live in a Zustand store (`useChatStore`) and are appended to the server history at render time. Swapping to a real backend later means editing one function; no component changes.

**Tech Stack:** React 19, TypeScript, Tailwind v4 (semantic tokens), TanStack React Query, Zustand.

## Global Constraints

- **No test runner exists** in `camply-frontend`. Each task's verification is `npm run validate` (oxlint + prettier check + `tsc` typecheck) — which also runs on the husky pre-commit hook — plus a manual check on the dev server (`npm run dev`). Do NOT add a test framework.
- **Trilingual, no hardcoded copy.** Every user-facing string goes through `useTranslation()` and must exist in UZ, RU, EN in `src/i18n/translations.ts`. Language order is `['uz', 'ru', 'en']`.
- **Dark-mode-safe tokens only.** Use semantic Tailwind classes (`bg-canvas`, `bg-surface`, `bg-surface-2`, `text-content`, `text-muted`, `border-line`, `bg-soft`, `bg-green-tint`, `bg-amber-tint`, `text-pine`, `bg-amber`). Runtime avatar colors are the only justified inline `style` (Tailwind can't enumerate arbitrary hex).
- **The bottom-left `+` is attachments only** — never "add people." Participants cannot alter their roster.
- **Interpolation:** strings with `{tokens}` are filled via `interpolate(t.x, { token: value })` from `src/lib/interpolate.ts`.
- **File paths** are relative to `camply-frontend/`.
- Commit after each task. End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

---

## File Structure

```
src/lib/chat.ts                                  (create) contract + useChat()
src/lib/mockChat.ts                              (create) hardcoded chat content
src/lib/formatFileSize.ts                        (create) '1.2 MB' formatter
src/store/useChatStore.ts                        (create) session-sent messages
src/i18n/translations.ts                         (modify) add ChatStrings + chat block ×3
src/components/participant/chat/MessageBubble.tsx (create)
src/components/participant/chat/MessageList.tsx   (create)
src/components/participant/chat/ChatHeader.tsx    (create)
src/components/participant/chat/PinnedBar.tsx     (create)
src/components/participant/chat/MemberSheet.tsx   (create)
src/components/participant/chat/AttachmentMenu.tsx(create)
src/components/participant/chat/Composer.tsx      (create)
src/components/participant/chat/ChatScreen.tsx    (create) composes everything
src/components/participant/ParticipantDashboard.tsx (modify) render ChatScreen on chat tab
```

---

## Task 1: Data contract, mock, and `useChat()` hook

**Files:**
- Create: `src/lib/chat.ts`
- Create: `src/lib/mockChat.ts`
- Create: `src/lib/formatFileSize.ts`

**Interfaces:**
- Produces: `ChatMember`, `ChatMessage`, `ChatMessageKind`, `GroupChat` types; `useChat()` hook returning React Query result of `GroupChat`; `formatFileSize(bytes: number): string`.

- [ ] **Step 1: Create `src/lib/formatFileSize.ts`**

```ts
// Human-readable file size for attachment bubbles: 940 → '940 B', 1536 → '1.5 KB'.
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
}
```

- [ ] **Step 2: Create `src/lib/chat.ts` (contract + hook)**

```ts
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
}

export type GroupChat = {
  group: {
    name: string
    emoji: string
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
```

- [ ] **Step 3: Create `src/lib/mockChat.ts` (the only hardcoded chat content)**

```ts
import type { GroupChat } from './chat'

/*
  Mock backing store for the group chat — stands in for the database until the
  backend exists. This is the ONLY file that hardcodes chat content; fetchGroupChat()
  in chat.ts is the seam where it gets swapped for a real API call. Shaped by the
  GroupChat contract so the mock and the real response stay identical.
*/
export const groupChatMock: GroupChat = {
  group: { name: 'Pine Wolves', emoji: '🐺', memberCount: 5, onlineCount: 3 },
  pinned: 'Bus to Chimgan leaves 7:00 sharp — meet at the main gate.',
  members: [
    {
      id: 'sardor',
      name: 'Sardor A.',
      initials: 'SA',
      color: '#0f6b4f',
      city: 'Tashkent',
      age: 19,
      role: 'leader',
      online: true,
      socials: { telegram: '@sardor', instagram: '@sardor.a' },
    },
    {
      id: 'aziza',
      name: 'Aziza R.',
      initials: 'AR',
      color: '#5aa9c4',
      city: 'Tashkent',
      age: 17,
      role: 'member',
      online: true,
      socials: { telegram: '@aziza', instagram: '@aziza.r' },
    },
    {
      id: 'me',
      name: 'You',
      initials: 'BT',
      color: '#2f8f6b',
      city: 'Samarkand',
      age: 16,
      role: 'member',
      online: true,
      isMe: true,
    },
    {
      id: 'dilnoza',
      name: 'Dilnoza K.',
      initials: 'DK',
      color: '#e0982a',
      city: 'Bukhara',
      age: 18,
      role: 'member',
      online: false,
      socials: { telegram: '@dilnoza' },
    },
    {
      id: 'jasur',
      name: 'Jasur M.',
      initials: 'JM',
      color: '#a86a08',
      city: 'Namangan',
      age: 17,
      role: 'member',
      online: false,
    },
  ],
  messages: [
    { id: 's1', authorId: '', kind: 'system', time: '08:00', sentByMe: false, text: 'Sardor A. created the group' },
    { id: 'm1', authorId: 'aziza', kind: 'text', time: '09:12', sentByMe: false, text: "Who's bringing the speaker tonight? 🔊" },
    { id: 'm2', authorId: 'me', kind: 'text', time: '09:14', sentByMe: true, text: 'I got it 👍 see you at the campfire' },
    { id: 'm3', authorId: 'sardor', kind: 'text', time: '09:20', sentByMe: false, text: 'Nice. Roll call at the gate 6:45 please.' },
    { id: 'm4', authorId: 'dilnoza', kind: 'text', time: '09:26', sentByMe: false, text: 'On my way 🏃‍♀️' },
  ],
}
```

- [ ] **Step 4: Verify**

Run: `npm run validate`
Expected: passes (lint + format + typecheck clean). If prettier flags formatting, run `npm run format` then re-run.

- [ ] **Step 5: Commit**

```bash
git add src/lib/chat.ts src/lib/mockChat.ts src/lib/formatFileSize.ts
git commit -m "feat(chat): add group chat data contract, mock, and useChat hook"
```

---

## Task 2: i18n — add the `chat` string block (UZ/RU/EN)

**Files:**
- Modify: `src/i18n/translations.ts`

**Interfaces:**
- Produces: `t.chat.*` keys available via `useTranslation()`.

- [ ] **Step 1: Add the `ChatStrings` type** after `CommonStrings` (around line 206, before `export const translations`)

```ts
// Participant group chat — header, composer, attachment menu, member profile sheet.
type ChatStrings = {
  membersOnline: string // '{members} members · {online} online'
  messagePlaceholder: string // 'Message {group}…'
  attach: string // aria-label for the + button
  photo: string
  file: string
  send: string // aria-label for send
  emptyThread: string
  loading: string
  loadError: string
  // Member profile sheet
  leaderRole: string // 'Group leader'
  memberRole: string // 'Member'
  you: string
  leaderBadge: string // 'Leader'
  ageYears: string // '{age} years'
  socials: string
  noSocials: string
}
```

- [ ] **Step 2: Register it on the master type** — inside the `Record<Lang, { … }>` (around line 219, after `profile: ProfileStrings`)

```ts
    profile: ProfileStrings
    chat: ChatStrings
    common: CommonStrings
```

- [ ] **Step 3: Add the `chat` block to the `uz` object** (place it right after the `uz` object's `profile: { … },` block, before `common:`)

```ts
    chat: {
      membersOnline: '{members} aʼzo · {online} onlayn',
      messagePlaceholder: '{group} guruhiga yozing…',
      attach: 'Biriktirish',
      photo: 'Rasm',
      file: 'Fayl',
      send: 'Yuborish',
      emptyThread: 'Hali xabar yoʻq. Birinchi boʻlib salom bering!',
      loading: 'Yuklanmoqda…',
      loadError: 'Chatni yuklab boʻlmadi',
      leaderRole: 'Guruh sardori',
      memberRole: 'Aʼzo',
      you: 'Siz',
      leaderBadge: 'Sardor',
      ageYears: '{age} yosh',
      socials: 'Ijtimoiy tarmoqlar',
      noSocials: 'Havolalar yoʻq',
    },
```

- [ ] **Step 4: Add the `chat` block to the `ru` object** (same position in the `ru` object)

```ts
    chat: {
      membersOnline: '{members} участников · {online} онлайн',
      messagePlaceholder: 'Написать {group}…',
      attach: 'Прикрепить',
      photo: 'Фото',
      file: 'Файл',
      send: 'Отправить',
      emptyThread: 'Сообщений пока нет. Напишите первым!',
      loading: 'Загрузка…',
      loadError: 'Не удалось загрузить чат',
      leaderRole: 'Лидер группы',
      memberRole: 'Участник',
      you: 'Вы',
      leaderBadge: 'Лидер',
      ageYears: '{age} лет',
      socials: 'Соцсети',
      noSocials: 'Нет ссылок',
    },
```

- [ ] **Step 5: Add the `chat` block to the `en` object** (same position in the `en` object)

```ts
    chat: {
      membersOnline: '{members} members · {online} online',
      messagePlaceholder: 'Message {group}…',
      attach: 'Attach',
      photo: 'Photo',
      file: 'File',
      send: 'Send',
      emptyThread: 'No messages yet. Say hi!',
      loading: 'Loading…',
      loadError: "Couldn't load chat",
      leaderRole: 'Group leader',
      memberRole: 'Member',
      you: 'You',
      leaderBadge: 'Leader',
      ageYears: '{age} years',
      socials: 'Socials',
      noSocials: 'No links yet',
    },
```

- [ ] **Step 6: Verify**

Run: `npm run validate`
Expected: passes. `tsc` guarantees all three languages have the `chat` block (the `Record<Lang, …>` type fails the build if one is missing) — this is the safety net.

- [ ] **Step 7: Commit**

```bash
git add src/i18n/translations.ts
git commit -m "feat(chat): add trilingual chat copy (uz/ru/en)"
```

---

## Task 3: `useChatStore` — session-sent messages

**Files:**
- Create: `src/store/useChatStore.ts`

**Interfaces:**
- Consumes: `ChatMessage` from `../lib/chat`.
- Produces: `useChatStore` with `sent: ChatMessage[]`, `sendText(text)`, `sendAttachment(file)`, `reset()`.

- [ ] **Step 1: Create `src/store/useChatStore.ts`**

```ts
import { create } from 'zustand'
import type { ChatMessage } from '../lib/chat'

/*
  CLIENT state — the messages the participant sends THIS session. Kept separate
  from server history (useChat) exactly like useProfileStore is separate from
  useCampHome: the store is what becomes a `POST /groups/:id/messages` mutation
  when the backend lands. Until then, sends are optimistic and local, and they
  persist across tab switches because the store outlives the ChatScreen.

  Author identity for these messages ('me') is resolved in the UI from
  useProfileStore, so the store only needs to carry the message payload.
*/

let seq = 0
const nextId = () => `local-${Date.now()}-${seq++}`
const nowHHMM = () => new Date().toTimeString().slice(0, 5)

type ChatState = {
  sent: ChatMessage[]
  sendText: (text: string) => void
  sendAttachment: (file: File) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  sent: [],

  sendText: (text) => {
    const clean = text.trim()
    if (!clean) return
    set((s) => ({
      sent: [
        ...s.sent,
        { id: nextId(), authorId: 'me', kind: 'text', text: clean, time: nowHHMM(), sentByMe: true },
      ],
    }))
  },

  sendAttachment: (file) => {
    // Local preview only — a browser object URL stands in for the uploaded URL.
    const url = URL.createObjectURL(file)
    const kind = file.type.startsWith('image/') ? 'image' : 'file'
    set((s) => ({
      sent: [
        ...s.sent,
        {
          id: nextId(),
          authorId: 'me',
          kind,
          attachment: { name: file.name, url, size: file.size },
          time: nowHHMM(),
          sentByMe: true,
        },
      ],
    }))
  },

  reset: () => set({ sent: [] }),
}))
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/store/useChatStore.ts
git commit -m "feat(chat): add useChatStore for session-sent messages"
```

---

## Task 4: `MessageBubble` — the three bubble variants

**Files:**
- Create: `src/components/participant/chat/MessageBubble.tsx`

**Interfaces:**
- Consumes: `ChatMessage`, `ChatMember` from `../../../lib/chat`; `formatFileSize` from `../../../lib/formatFileSize`.
- Produces: `MessageBubble({ message, author?, onAuthorTap? })`.

- [ ] **Step 1: Create `src/components/participant/chat/MessageBubble.tsx`**

```tsx
import type { ChatMessage, ChatMember } from '../../../lib/chat'
import { formatFileSize } from '../../../lib/formatFileSize'

type Props = {
  message: ChatMessage
  /** The author, for other people's messages (drives name + avatar). */
  author?: ChatMember
  /** Open the author's profile sheet (avatar/name tap). */
  onAuthorTap?: () => void
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
          <span className="block truncate text-[13px] font-semibold">{message.attachment.name}</span>
          {message.attachment.size ? (
            <span className="block text-[10px] opacity-70">{formatFileSize(message.attachment.size)}</span>
          ) : null}
        </span>
      </span>
    )
  }
  return <span>{message.text}</span>
}

/*
  One chat row. Three shapes:
    • system → centered pill (joins, group created)
    • sentByMe → amber gradient bubble, right-aligned, static ✓✓
    • other → surface bubble, left-aligned, with tappable avatar + name
*/
export function MessageBubble({ message, author, onAuthorTap }: Props) {
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
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-[18px_3px_18px_18px] bg-gradient-to-br from-[#f2ad42] to-amber px-3.5 pb-2 pt-2.5 text-[13.5px] leading-snug text-[#3a2807] shadow-[0_4px_12px_rgba(224,152,42,0.3)]">
          <Body message={message} />
          <span className="mt-1 block text-right text-[9px] text-[rgba(58,40,7,0.55)]">
            {message.time} ✓✓
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
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ backgroundColor: author?.color ?? '#5aa9c4' }}
      >
        {author?.initials ?? '?'}
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
        <div className="rounded-[3px_18px_18px_18px] bg-surface px-3.5 pb-2 pt-2.5 text-[13.5px] leading-snug text-content shadow-[0_3px_10px_rgba(20,40,30,0.07)]">
          <Body message={message} />
          <span className="mt-1 block text-right text-[9px] text-muted">{message.time}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/participant/chat/MessageBubble.tsx
git commit -m "feat(chat): add MessageBubble with system/me/other variants"
```

---

## Task 5: `MessageList` — merge server + local, auto-scroll

**Files:**
- Create: `src/components/participant/chat/MessageList.tsx`

**Interfaces:**
- Consumes: `ChatMember`, `ChatMessage` from `../../../lib/chat`; `useChatStore`; `MessageBubble`.
- Produces: `MessageList({ members, serverMessages, onMemberTap, emptyLabel })`.

- [ ] **Step 1: Create `src/components/participant/chat/MessageList.tsx`**

```tsx
import { useEffect, useMemo, useRef } from 'react'
import type { ChatMember, ChatMessage } from '../../../lib/chat'
import { useChatStore } from '../../../store/useChatStore'
import { MessageBubble } from './MessageBubble'

type Props = {
  members: ChatMember[]
  serverMessages: ChatMessage[]
  /** Open a member's profile sheet when their avatar/name is tapped. */
  onMemberTap: (member: ChatMember) => void
  emptyLabel: string
}

/*
  The scrollable thread. The rendered list = server history + this-session sends
  (from useChatStore), server first. Auto-scrolls to the newest message on mount
  and whenever the count changes (i.e. after a send).
*/
export function MessageList({ members, serverMessages, onMemberTap, emptyLabel }: Props) {
  const sent = useChatStore((s) => s.sent)
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
        return (
          <MessageBubble
            key={m.id}
            message={m}
            author={author}
            onAuthorTap={author ? () => onMemberTap(author) : undefined}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/participant/chat/MessageList.tsx
git commit -m "feat(chat): add MessageList merging server + local sends with auto-scroll"
```

---

## Task 6: `ChatHeader` — group identity + online rail

**Files:**
- Create: `src/components/participant/chat/ChatHeader.tsx`

**Interfaces:**
- Consumes: `GroupChat`, `ChatMember` from `../../../lib/chat`; `useTranslation`; `interpolate`.
- Produces: `ChatHeader({ group, members, onMemberTap })`.

- [ ] **Step 1: Create `src/components/participant/chat/ChatHeader.tsx`**

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { GroupChat, ChatMember } from '../../../lib/chat'

type Props = {
  group: GroupChat['group']
  members: ChatMember[]
  onMemberTap: (member: ChatMember) => void
}

/*
  Chat top bar: group emoji tile + name + "N members · M online", and a horizontal
  rail of member avatars (online dot). Tapping any avatar opens that member's
  profile sheet. No "add people" — participants can't change the roster.
*/
export function ChatHeader({ group, members, onMemberTap }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex-none border-b border-line bg-surface-2 px-4 pt-3 shadow-[0_3px_12px_rgba(20,40,30,0.05)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-[15px] bg-gradient-to-br from-[#2f8f6b] to-pine text-[22px] shadow-[0_4px_10px_rgba(15,107,79,0.25)]">
          {group.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-bold text-content">{group.name}</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-pine">
            <span className="h-1.5 w-1.5 rounded-full bg-pine" />
            {interpolate(t.chat.membersOnline, { members: group.memberCount, online: group.onlineCount })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto py-3">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onMemberTap(m)}
            className="flex w-[52px] flex-none flex-col items-center gap-1"
          >
            <span className="relative">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: m.color }}
              >
                {m.initials}
              </span>
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-2 ${
                  m.online ? 'bg-pine' : 'bg-muted'
                }`}
              />
            </span>
            <span className="max-w-[52px] truncate text-[10px] font-semibold text-muted">
              {m.isMe ? t.chat.you : m.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/participant/chat/ChatHeader.tsx
git commit -m "feat(chat): add ChatHeader with online member rail"
```

---

## Task 7: `PinnedBar` — pinned message strip

**Files:**
- Create: `src/components/participant/chat/PinnedBar.tsx`

**Interfaces:**
- Produces: `PinnedBar({ text })`.

- [ ] **Step 1: Create `src/components/participant/chat/PinnedBar.tsx`**

```tsx
type Props = {
  text: string
}

// Amber pinned-message strip below the header. Rendered only when a pin exists.
export function PinnedBar({ text }: Props) {
  return (
    <div className="mx-3.5 mt-2.5 flex flex-none items-center gap-2 rounded-2xl border border-amber/30 bg-amber-tint px-3.5 py-2.5">
      <span className="flex-none text-sm">📌</span>
      <p className="flex-1 text-xs font-semibold leading-snug text-content">{text}</p>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/participant/chat/PinnedBar.tsx
git commit -m "feat(chat): add PinnedBar"
```

---

## Task 8: `MemberSheet` — groupmate profile peek

**Files:**
- Create: `src/components/participant/chat/MemberSheet.tsx`

**Interfaces:**
- Consumes: `ChatMember` from `../../../lib/chat`; `useTranslation`; `interpolate`.
- Produces: `MemberSheet({ member, onClose })` — renders nothing when `member` is null.

- [ ] **Step 1: Create `src/components/participant/chat/MemberSheet.tsx`**

```tsx
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { ChatMember } from '../../../lib/chat'

type Props = {
  member: ChatMember | null
  onClose: () => void
}

const SOCIAL_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
}

/*
  Bottom-sheet profile peek for a tapped groupmate. Same sheet language as
  LanguageSheet: dimmed backdrop + slide-up surface. Shows avatar, name, city·age,
  role badge, and social links. Renders nothing when no member is selected.
*/
export function MemberSheet({ member, onClose }: Props) {
  const { t } = useTranslation()
  if (!member) return null

  const socials = member.socials
    ? Object.entries(member.socials).filter(([, v]) => v)
    : []

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label={t.notfound.back} onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="animate-sheet-up absolute inset-x-0 bottom-0 rounded-t-[24px] bg-surface-2 px-[18px] pb-7 pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.22)]">
        <div className="mx-auto mb-4 mt-1.5 h-1 w-10 rounded-full bg-line" />

        <div className="flex flex-col items-center text-center">
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: member.color }}
          >
            {member.initials}
          </span>
          <div className="mt-3 text-[19px] font-bold text-content">
            {member.isMe ? t.chat.you : member.name}
          </div>
          <div className="mt-0.5 text-[13px] text-muted">
            {member.city} · {interpolate(t.chat.ageYears, { age: member.age })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {member.role === 'leader' && (
              <span className="rounded-full bg-amber-tint px-3 py-1 text-[11px] font-bold text-amber">
                ★ {t.chat.leaderBadge}
              </span>
            )}
            <span className="rounded-full bg-green-tint px-3 py-1 text-[11px] font-bold text-pine">
              {member.role === 'leader' ? t.chat.leaderRole : t.chat.memberRole}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
            {t.chat.socials}
          </div>
          {socials.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] text-muted">
              {t.chat.noSocials}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {socials.map(([key, handle]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3"
                >
                  <span className="text-[13px] font-semibold text-content">{SOCIAL_LABELS[key] ?? key}</span>
                  <span className="text-[13px] text-muted">{handle}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/components/participant/chat/MemberSheet.tsx
git commit -m "feat(chat): add MemberSheet profile peek"
```

---

## Task 9: `AttachmentMenu` + `Composer` — input bar with attachments

**Files:**
- Create: `src/components/participant/chat/AttachmentMenu.tsx`
- Create: `src/components/participant/chat/Composer.tsx`

**Interfaces:**
- Consumes: `useTranslation`, `interpolate`.
- Produces: `AttachmentMenu({ open, onClose, onPickPhoto, onPickFile })`; `Composer({ groupName, onSendText, onPickFile })`.

- [ ] **Step 1: Create `src/components/participant/chat/AttachmentMenu.tsx`**

```tsx
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
      <button type="button" aria-label={t.notfound.back} onClick={onClose} className="fixed inset-0 z-[40]" />
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
```

- [ ] **Step 2: Create `src/components/participant/chat/Composer.tsx`**

```tsx
import { useRef, useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { AttachmentMenu } from './AttachmentMenu'

type Props = {
  groupName: string
  onSendText: (text: string) => void
  onPickFile: (file: File) => void
}

/*
  Bottom input bar. Left "+" opens the attachment menu (Photo/File) → a hidden
  file input → onPickFile. The text field + send button push a text message.
  Enter sends; empty messages are ignored (guarded in the store too).
*/
export function Composer({ groupName, onSendText, onPickFile }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

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

      <input ref={photoInput} type="file" accept="image/*" onChange={handleFile} className="hidden" aria-hidden />
      <input ref={fileInput} type="file" onChange={handleFile} className="hidden" aria-hidden />

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={t.chat.attach}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-soft text-pine transition active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <input
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
```

- [ ] **Step 3: Verify**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/participant/chat/AttachmentMenu.tsx src/components/participant/chat/Composer.tsx
git commit -m "feat(chat): add Composer with attachment menu (photo/file)"
```

---

## Task 10: `ChatScreen` + wire into `ParticipantDashboard`

**Files:**
- Create: `src/components/participant/chat/ChatScreen.tsx`
- Modify: `src/components/participant/ParticipantDashboard.tsx`

**Interfaces:**
- Consumes: `useChat` from `../../../lib/chat`; `useChatStore`; `useProfileStore`; `useTranslation`; all chat components above.
- Produces: `ChatScreen()` (no props — reads its own data).

- [ ] **Step 1: Create `src/components/participant/chat/ChatScreen.tsx`**

```tsx
import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { useChat, type ChatMember } from '../../../lib/chat'
import { useChatStore } from '../../../store/useChatStore'
import { ChatHeader } from './ChatHeader'
import { PinnedBar } from './PinnedBar'
import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { MemberSheet } from './MemberSheet'

/*
  The Chat tab. Owns the selected-member sheet state and stitches the pieces
  together. Server data (group, members, history) comes from useChat(); sends go
  through useChatStore. Loading / error / empty states are all handled.
*/
export function ChatScreen() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useChat()
  const sendText = useChatStore((s) => s.sendText)
  const sendAttachment = useChatStore((s) => s.sendAttachment)
  const [selected, setSelected] = useState<ChatMember | null>(null)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-[13px] text-muted">
        {t.chat.loading}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas px-8 text-center text-[13px] text-muted">
        {t.chat.loadError}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      <ChatHeader group={data.group} members={data.members} onMemberTap={setSelected} />
      {data.pinned && <PinnedBar text={data.pinned} />}
      <MessageList
        members={data.members}
        serverMessages={data.messages}
        onMemberTap={setSelected}
        emptyLabel={t.chat.emptyThread}
      />
      <Composer groupName={data.group.name} onSendText={sendText} onPickFile={sendAttachment} />
      <MemberSheet member={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `ParticipantDashboard.tsx`** — add the import near the other participant imports (after line 8):

```tsx
import { ChatScreen } from './chat/ChatScreen'
```

- [ ] **Step 3: Add the chat branch** in `ParticipantDashboard.tsx` — change the render tree so the chat tab shows `ChatScreen`. Replace the `) : (` fallback that renders `ComingSoon` (lines 73-75) with a chat branch first:

```tsx
        ) : tab === 'chat' ? (
          <ChatScreen />
        ) : (
          <ComingSoon title={tabTitles[tab]} />
        )}
```

- [ ] **Step 4: Verify (typecheck/lint)**

Run: `npm run validate`
Expected: passes.

- [ ] **Step 5: Manual verification on the dev server**

Run: `npm run dev`, open the app, log in as a participant (`901234567`), finish onboarding into the dashboard, tap the **Chat** tab. Confirm:
- Header shows 🐺 Pine Wolves, "5 members · 3 online", and a scrollable avatar rail with online dots.
- Pinned amber strip shows the bus message.
- Thread shows the seeded conversation; your messages are amber/right, others surface/left with names.
- Type a message + Enter (or send) → your amber bubble appears instantly and the thread scrolls to it.
- Tap `+` → Photo → pick an image → it appears as an image bubble. Tap `+` → File → pick any file → file bubble with name + size.
- Tap a groupmate's avatar (rail or bubble) → profile sheet slides up with city, age, role badge, socials; tap outside closes it.
- Toggle dark mode (from Profile tab) → chat re-themes correctly, no white flashes.
- Switch language (Profile → language) → header count, placeholder, menu, and sheet labels all translate.

- [ ] **Step 6: Commit**

```bash
git add src/components/participant/chat/ChatScreen.tsx src/components/participant/ParticipantDashboard.tsx
git commit -m "feat(chat): wire ChatScreen into the participant Chat tab"
```

---

## Self-Review

**Spec coverage:**
- Fully interactive local send → Tasks 3, 9, 10 (store + composer + wiring). ✓
- Data seam / backend-ready contract → Task 1. ✓
- Member profile bottom sheet → Task 8. ✓
- Attachments (real picker + local preview) → Tasks 3, 9. ✓
- `+` is attachments, never add-people → Task 9 (AttachmentMenu). ✓
- Trilingual copy → Task 2. ✓
- Dark-mode tokens → all component tasks use semantic classes. ✓
- Online rail, pinned bar, three bubble variants → Tasks 4, 6, 7. ✓
- Loading / error / empty states → Tasks 5, 10. ✓

**Type consistency:** `ChatMember`, `ChatMessage`, `GroupChat` defined in Task 1 are consumed with the same names/fields throughout. `useChat` (Task 1), `useChatStore` with `sendText`/`sendAttachment`/`sent` (Task 3), `ChatHeader`/`MessageList`/`Composer`/`MemberSheet` props all match their producer declarations. `formatFileSize` (Task 1) consumed in Task 4.

**Placeholder scan:** No TBD/TODO; every code step contains complete code.

**Note on the unread badge:** the Chat tab's unread count comes from `useCampHome().unreadChat` (existing). Clearing it on open is server state and is intentionally out of scope for this frontend-only plan.
