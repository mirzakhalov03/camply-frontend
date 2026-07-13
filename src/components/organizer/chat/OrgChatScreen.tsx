import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { useOrgChat } from '../../../api/queries/orgChat.queries'
import type { OrgChatChannelId } from '../../../api/services/orgChat.service'
import {
  withMyProfile,
  type ChatMember,
  type ChatMessage,
  type MessageReaction,
} from '../../../lib/chat'
import { useOrgChatStore } from '../../../store/useOrgChatStore'
import { useOrganizerStore } from '../../../store/useOrganizerStore'
import { useGroupStore } from '../../../store/useGroupStore'
import { useMe } from '@/hooks/useMe'
import { Avatar, GroupPhotoButton } from '../../ui'
import { Composer } from '../../participant/chat/Composer'
import { MessageBubble } from '../../participant/chat/MessageBubble'
import { MemberSheet } from '../../participant/chat/MemberSheet'
import { OrgChatMembersSheet } from './OrgChatMembersSheet'

/*
  The organizer Chat tab. Two channels — the Organizers team (always on) and the
  coordinator's own group (gated: only a 'coordinator' sees it, else a lock panel).
  Reuses the participant Composer + the ChatMember/ChatMessage contracts; sends flow
  through the per-channel useOrgChatStore so the two threads never mix.
*/
export function OrgChatScreen() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useOrgChat()
  const me = useMe()
  const role = useOrganizerStore((s) => s.role)
  const [channel, setChannel] = useState<OrgChatChannelId>('organizers')
  const [membersOpen, setMembersOpen] = useState(false)
  // The message being replied to (per the active channel; cleared on switch/send).
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  // Whose profile peek is open (tapped author avatar / members-list row).
  const [selected, setSelected] = useState<ChatMember | null>(null)

  const sent = useOrgChatStore((s) => s.sent[channel])
  const reactionOverrides = useOrgChatStore((s) => s.reactionOverrides[channel])
  const sendText = useOrgChatStore((s) => s.sendText)
  const sendAttachment = useOrgChatStore((s) => s.sendAttachment)
  const toggleReaction = useOrgChatStore((s) => s.toggleReaction)
  // The Organizers team's own photo (org-chat-local, not the participant group photo).
  const teamPhoto = useOrgChatStore((s) => s.teamPhoto)
  const setTeamPhoto = useOrgChatStore((s) => s.setTeamPhoto)

  // My group's identity photo — shared with the participant's group view (same store).
  const groupPhoto = useGroupStore((s) => s.photo)
  const setGroupPhoto = useGroupStore((s) => s.setPhoto)

  // Switching channels drops any in-progress reply and closes the members sheet
  // (both belonged to the old thread; the new one may be locked).
  const switchChannel = (next: OrgChatChannelId) => {
    setChannel(next)
    setReplyingTo(null)
    setMembersOpen(false)
  }

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-body text-muted">
        …
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas px-8 text-center text-body text-muted">
        {t.org.detail.loadError}
      </div>
    )
  }

  const active = channel === 'organizers' ? data.organizers : data.group
  const isCoordinator = role === 'coordinator'
  const locked = channel === 'group' && !isCoordinator

  const title = channel === 'organizers' ? t.org.chat.channelOrganizers : active.title
  const members = withMyProfile(active.members, me)

  // Each channel owns its photo: the Organizers team photo lives in the org-chat store
  // (any organizer can set it); the "My group" photo is the shared group identity, and
  // only its coordinator may change it. When the group is locked there's no uploader.
  const channelPhoto = channel === 'group' ? groupPhoto : teamPhoto
  const onPickPhoto =
    channel === 'group' ? (isCoordinator ? setGroupPhoto : undefined) : setTeamPhoto

  // Reply-quote helpers (mirror the participant ChatScreen): author name + a snippet.
  const authorNameOf = (msg: ChatMessage) =>
    msg.sentByMe ? t.chat.you : (members.find((m) => m.id === msg.authorId)?.name ?? '')
  const snippetOf = (msg: ChatMessage) =>
    msg.kind === 'image'
      ? `📷 ${t.chat.photo}`
      : msg.kind === 'file'
        ? `📎 ${msg.attachment?.name ?? t.chat.file}`
        : (msg.text ?? '')
  const replyPreview = replyingTo
    ? { authorName: authorNameOf(replyingTo), text: snippetOf(replyingTo) }
    : null

  const handleSendText = (text: string) => {
    sendText(channel, text, replyPreview ?? undefined)
    setReplyingTo(null)
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      {/* Header */}
      <div className="flex-none border-b border-line bg-surface-2 px-4 pt-3 shadow-[0_3px_12px_rgba(20,40,30,0.05)]">
        <div className="flex items-center gap-3">
          {/* Group photo — same shared uploader as the participant chat header,
              top-left. Editable per channel (see onPickPhoto); a locked group is
              a static emoji tile. */}
          <GroupPhotoButton
            photo={channelPhoto}
            emoji={active.emoji}
            label={t.chat.changePhoto}
            onPick={onPickPhoto}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-subhead font-bold text-content">{title}</div>
            <div className="flex items-center gap-1.5 text-caption font-semibold text-pine">
              <span className="h-1.5 w-1.5 rounded-full bg-pine" />
              {interpolate(t.org.chat.online, { count: active.onlineCount })}
            </div>
          </div>
          {/* Members button — hidden on a locked group: a non-coordinator shouldn't
              be able to open that group's member list. */}
          {!locked && (
            <button
              type="button"
              onClick={() => setMembersOpen(true)}
              aria-label={t.org.chat.membersSheetTitle}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-input bg-soft text-pine active:scale-95"
            >
              <MembersIcon />
            </button>
          )}
        </div>

        {/* Channel toggle */}
        <div className="mt-3 flex gap-1 rounded-input bg-soft p-1">
          <ChannelTab active={channel === 'organizers'} onClick={() => switchChannel('organizers')}>
            {t.org.chat.channelOrganizers}
          </ChannelTab>
          <ChannelTab active={channel === 'group'} onClick={() => switchChannel('group')}>
            {t.org.chat.channelGroup}
          </ChannelTab>
        </div>

        {/* Online rail */}
        {!locked && (
          <div className="flex gap-3 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {members.map((m) => (
              <div key={m.id} className="flex w-12 flex-none flex-col items-center gap-1">
                <div className="relative">
                  <Avatar
                    name={m.name}
                    initials={m.initials}
                    color={m.color}
                    photo={m.photo}
                    size={44}
                  />
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-2 ${
                      m.online ? 'bg-pine' : 'bg-muted'
                    }`}
                  />
                </div>
                <span className="max-w-12 truncate text-[10px] font-semibold text-muted">
                  {m.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {locked ? (
        <LockedPanel title={t.org.chat.lockedTitle} body={t.org.chat.lockedBody} />
      ) : (
        <>
          <MessageThread
            messages={active.messages}
            sent={sent}
            members={members}
            reactionOverrides={reactionOverrides}
            onToggleReaction={(id, emoji, current) => toggleReaction(channel, id, emoji, current)}
            onReply={setReplyingTo}
            onMemberTap={setSelected}
          />
          <Composer
            groupName={title}
            onSendText={handleSendText}
            onPickFile={(file) => sendAttachment(channel, file)}
            replyPreview={replyPreview}
            onCancelReply={() => setReplyingTo(null)}
          />
        </>
      )}

      <OrgChatMembersSheet
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        title={title}
        members={members}
        onMemberTap={(m) => {
          setMembersOpen(false)
          setSelected(m)
        }}
      />
      <MemberSheet member={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function MessageThread({
  messages,
  sent,
  members,
  reactionOverrides,
  onToggleReaction,
  onReply,
  onMemberTap,
}: {
  messages: ChatMessage[]
  sent: ChatMessage[]
  members: ChatMember[]
  reactionOverrides: Record<string, MessageReaction[]>
  onToggleReaction: (messageId: string, emoji: string, current: MessageReaction[]) => void
  onReply: (message: ChatMessage) => void
  onMemberTap: (member: ChatMember) => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const all = useMemo(() => [...messages, ...sent], [messages, sent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [all.length])

  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
      {all.map((m) => {
        // Displayed reactions = this-session overlay if present, else what the server sent.
        const reactions = reactionOverrides[m.id] ?? m.reactions ?? []
        const author = byId.get(m.authorId)
        return (
          <MessageBubble
            key={m.id}
            message={m}
            author={author}
            onAuthorTap={author ? () => onMemberTap(author) : undefined}
            reactions={reactions}
            onToggleReaction={(emoji) => onToggleReaction(m.id, emoji, reactions)}
            onReply={() => onReply(m)}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

function LockedPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-soft text-4xl">
        🔒
      </span>
      <h2 className="mt-5 text-heading font-bold text-content">{title}</h2>
      <p className="mt-1.5 max-w-xs text-body text-muted">{body}</p>
    </div>
  )
}

function ChannelTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-[10px] py-2 text-body font-semibold transition ${
        active ? 'bg-surface text-content shadow-sm' : 'text-muted'
      }`}
    >
      {children}
    </button>
  )
}

function MembersIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3.1" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="18" cy="9" r="2.4" />
      <path d="M16.5 14.5a4.4 4.4 0 0 1 4 4" />
    </svg>
  )
}
