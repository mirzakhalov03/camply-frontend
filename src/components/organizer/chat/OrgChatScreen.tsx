import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import { useOrgChat } from '../../../api/queries/orgChat.queries'
import type { OrgChatChannelId } from '../../../api/services/orgChat.service'
import { withMyProfile, type ChatMember, type ChatMessage } from '../../../lib/chat'
import { useOrgChatStore } from '../../../store/useOrgChatStore'
import { useOrganizerStore } from '../../../store/useOrganizerStore'
import { useMe } from '../../../store/useMe'
import { Avatar } from '../../ui'
import { Composer } from '../../participant/chat/Composer'
import { OrgMessageBubble } from './OrgMessageBubble'
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

  const sent = useOrgChatStore((s) => s.sent[channel])
  const sendText = useOrgChatStore((s) => s.sendText)
  const sendAttachment = useOrgChatStore((s) => s.sendAttachment)

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

  return (
    <div className="flex h-full flex-col bg-canvas">
      {/* Header */}
      <div className="flex-none border-b border-line bg-surface-2 px-4 pt-3 shadow-[0_3px_12px_rgba(20,40,30,0.05)]">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-input bg-gradient-to-br from-pine-light to-pine text-xl shadow-[0_4px_10px_rgba(15,107,79,0.25)]">
            {active.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-subhead font-bold text-content">{title}</div>
            <div className="flex items-center gap-1.5 text-caption font-semibold text-pine">
              <span className="h-1.5 w-1.5 rounded-full bg-pine" />
              {interpolate(t.org.chat.online, { count: active.onlineCount })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            aria-label={t.org.chat.membersSheetTitle}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-input bg-soft text-pine active:scale-95"
          >
            <MembersIcon />
          </button>
        </div>

        {/* Channel toggle */}
        <div className="mt-3 flex gap-1 rounded-input bg-soft p-1">
          <ChannelTab active={channel === 'organizers'} onClick={() => setChannel('organizers')}>
            {t.org.chat.channelOrganizers}
          </ChannelTab>
          <ChannelTab active={channel === 'group'} onClick={() => setChannel('group')}>
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
          <MessageThread messages={active.messages} sent={sent} members={members} />
          <Composer
            groupName={title}
            onSendText={(text) => sendText(channel, text)}
            onPickFile={(file) => sendAttachment(channel, file)}
            replyPreview={null}
            onCancelReply={() => {}}
          />
        </>
      )}

      <OrgChatMembersSheet
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        title={title}
        members={members}
      />
    </div>
  )
}

function MessageThread({
  messages,
  sent,
  members,
}: {
  messages: ChatMessage[]
  sent: ChatMessage[]
  members: ChatMember[]
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members])
  const all = useMemo(() => [...messages, ...sent], [messages, sent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [all.length])

  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
      {all.map((m) => (
        <OrgMessageBubble key={m.id} message={m} author={byId.get(m.authorId)} />
      ))}
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
