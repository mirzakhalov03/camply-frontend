import { useMemo, useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { withMyProfile, type ChatMember, type ChatMessage, type GroupChat } from '../../../lib/chat'
import { useChat } from '../../../api/queries/chat.queries'
import { useMyGroup } from '../../../api/queries/myGroup.queries'
import { useCamp } from '../campContext'
import { useChatStore } from '../../../store/useChatStore'
import { useGroupStore } from '../../../store/useGroupStore'
import { useAuthStore } from '../../../store/useAuthStore'
import { useMe } from '@/hooks/useMe'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { MemberSheet } from './MemberSheet'
import { MembersSheet } from './MembersSheet'

/*
  The Chat tab. Owns the selected-member sheet state and stitches the pieces
  together. Server data (members + history) comes from useChat(campId, groupId);
  the group identity comes from useMyGroup(). Sends flow over the socket
  (useChatStore → chat:send) and echo back into this same query cache.
*/
export function ChatScreen() {
  const { t } = useTranslation()
  const { campId } = useCamp()
  const { data: myGroup } = useMyGroup(campId)
  const groupId = myGroup?.id ?? ''
  const { data, isLoading, isError } = useChat(campId, groupId)
  const sendText = useChatStore((s) => s.sendText)
  // Group photo is shared identity (also shown on Ranks), so it lives in useGroupStore.
  const groupPhoto = useGroupStore((s) => s.photo)
  const setGroupPhoto = useGroupStore((s) => s.setPhoto)
  // My real identity, assembled once by useMe(); it overlays the placeholder "me"
  // member (see withMyProfile). myId is the SERVER identity, matching message.authorId.
  const me = useMe()
  const myId = useAuthStore((s) => s.user?.id) ?? ''
  const [selected, setSelected] = useState<ChatMember | null>(null)
  const [membersOpen, setMembersOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)

  // Server messages carry authorId, not sentByMe — derive it from my server identity.
  const serverMessages = useMemo(
    () => (data?.messages ?? []).map((m) => ({ ...m, sentByMe: m.authorId === myId })),
    [data?.messages, myId],
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-body text-muted">
        {t.chat.loading}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas px-8 text-center text-body text-muted">
        {t.chat.loadError}
      </div>
    )
  }

  // Overlay my profile onto the "me" member so the roster, rail, and member sheet
  // show my real name/photo/city. Server members carry name/initials/color/photo.
  const members = withMyProfile(data.members, me)

  // The header's group identity comes from useMyGroup (the chat history payload
  // carries members + messages, not the group card). Presence/onlineCount is a
  // later polish — 0 for now.
  const groupHeader: GroupChat['group'] = {
    name: myGroup?.name ?? '',
    emoji: '💬',
    photo: myGroup?.photo ?? undefined,
    memberCount: members.length,
    onlineCount: 0,
  }

  // Who wrote a message (for the reply quote): "You" for mine, else their name.
  const authorNameOf = (msg: ChatMessage) =>
    msg.sentByMe ? t.chat.you : (members.find((m) => m.id === msg.authorId)?.name ?? '')

  // A short preview of a message, used in the reply quote (handles attachments).
  const snippetOf = (msg: ChatMessage) =>
    msg.kind === 'image'
      ? `📷 ${t.chat.photo}`
      : msg.kind === 'file'
        ? `📎 ${msg.attachment?.name ?? t.chat.file}`
        : (msg.text ?? '')

  const replyPreview = replyingTo
    ? { authorName: authorNameOf(replyingTo), text: snippetOf(replyingTo) }
    : null

  // Send over the socket (optimistic echo reconciles into this same query cache).
  const handleSendText = (text: string) => {
    sendText(campId, groupId, text)
    setReplyingTo(null)
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      <ChatHeader
        group={groupHeader}
        members={members}
        onMemberTap={setSelected}
        onOpenMembers={() => setMembersOpen(true)}
        groupPhoto={groupPhoto}
        onChangePhoto={setGroupPhoto}
      />
      <MessageList
        campId={campId}
        groupId={groupId}
        members={members}
        serverMessages={serverMessages}
        onMemberTap={setSelected}
        onReply={setReplyingTo}
        emptyLabel={t.chat.emptyThread}
      />
      <Composer
        groupName={groupHeader.name}
        onSendText={handleSendText}
        replyPreview={replyPreview}
        onCancelReply={() => setReplyingTo(null)}
      />
      <MembersSheet
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
        group={groupHeader}
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
