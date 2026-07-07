import { useRef } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { GroupChat, ChatMember } from '../../../lib/chat'

type Props = {
  group: GroupChat['group']
  members: ChatMember[]
  onMemberTap: (member: ChatMember) => void
  /** Locally uploaded group photo (overrides the emoji tile). */
  groupPhoto: string | null
  /** Upload/replace the group photo. */
  onChangePhoto: (file: File) => void
}

/*
  Chat top bar: group photo/emoji tile + name + "N members · M online", and a
  horizontal rail of member avatars (online dot). Tapping the group tile uploads a
  photo; tapping a member avatar opens their profile sheet. No "add people" —
  participants can't change the roster.
*/
export function ChatHeader({ group, members, onMemberTap, groupPhoto, onChangePhoto }: Props) {
  const { t } = useTranslation()
  const photoInput = useRef<HTMLInputElement>(null)
  const photo = groupPhoto ?? group.photo

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChangePhoto(file)
    e.target.value = '' // allow re-picking the same file
  }

  return (
    <div className="flex-none border-b border-line bg-surface-2 px-4 pt-3 shadow-[0_3px_12px_rgba(20,40,30,0.05)]">
      <div className="flex items-center gap-3">
        {/* Group photo uploader — same treatment as the profile avatar badge:
            circular image with a pine "+" corner badge. */}
        <button
          type="button"
          onClick={() => photoInput.current?.click()}
          aria-label={t.chat.changePhoto}
          className="relative flex-none rounded-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[15px] bg-gradient-to-br from-[#2f8f6b] to-pine text-[22px] shadow-[0_4px_10px_rgba(15,107,79,0.25)]">
            {photo ? (
              <img src={photo} alt={group.name} className="h-full w-full object-cover" />
            ) : (
              group.emoji
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-surface-2 bg-pine shadow-[0_2px_6px_rgba(15,107,79,0.35)]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </button>
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="hidden"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-bold text-content">{group.name}</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-pine">
            <span className="h-1.5 w-1.5 rounded-full bg-pine" />
            {interpolate(t.chat.membersOnline, {
              members: group.memberCount,
              online: group.onlineCount,
            })}
          </div>
        </div>
      </div>

      {/* Online rail — ~5 avatars fit on a phone; the rest scroll horizontally
          (each is flex-none so they never squish). Scrollbar hidden for polish. */}
      <div className="flex gap-3 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
