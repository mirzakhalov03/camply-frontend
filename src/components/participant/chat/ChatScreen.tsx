import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { useChat, withMyProfile, type ChatMember, type ChatMessage } from '../../../lib/chat'
import { useChatStore } from '../../../store/useChatStore'
import { useGroupStore } from '../../../store/useGroupStore'
import { useProfileStore } from '../../../store/useProfileStore'
import { ChatHeader } from './ChatHeader'
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
  // Group photo is shared identity (also shown on Ranks), so it lives in useGroupStore.
  const groupPhoto = useGroupStore((s) => s.photo)
  const setGroupPhoto = useGroupStore((s) => s.setPhoto)
  // My real identity (name/photo/city…) lives in useProfileStore; it overlays the
  // placeholder "me" member the mock ships with (see withMyProfile).
  const myName = useProfileStore((s) => s.name)
  const mySurname = useProfileStore((s) => s.surname)
  const myInitials = useProfileStore((s) => s.initials)
  const myPhoto = useProfileStore((s) => s.photo)
  const myCity = useProfileStore((s) => s.city)
  const myAge = useProfileStore((s) => s.age)
  const mySocials = useProfileStore((s) => s.socials)
  const [selected, setSelected] = useState<ChatMember | null>(null)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)

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

  // Overlay my profile onto the placeholder "me" member so the roster, rail, and
  // member sheet all show my real name/photo/city instead of mock seed data.
  const members = withMyProfile(data.members, {
    name: `${myName} ${mySurname}`.trim(),
    initials: myInitials,
    photo: myPhoto,
    city: myCity?.name ?? '',
    age: myAge,
    socials: mySocials,
  })

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

  // Send a text message, attaching the reply snapshot if we're replying.
  const handleSendText = (text: string) => {
    sendText(text, replyPreview ?? undefined)
    setReplyingTo(null)
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      <ChatHeader
        group={data.group}
        members={members}
        onMemberTap={setSelected}
        groupPhoto={groupPhoto}
        onChangePhoto={setGroupPhoto}
      />
      <MessageList
        members={members}
        serverMessages={data.messages}
        onMemberTap={setSelected}
        onReply={setReplyingTo}
        emptyLabel={t.chat.emptyThread}
      />
      <Composer
        groupName={data.group.name}
        onSendText={handleSendText}
        onPickFile={sendAttachment}
        replyPreview={replyPreview}
        onCancelReply={() => setReplyingTo(null)}
      />
      <MemberSheet member={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
