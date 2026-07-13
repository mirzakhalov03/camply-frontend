import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Avatar, Badge, Sheet } from '../../ui'
import type { GroupChat, ChatMember } from '../../../lib/chat'

type Props = {
  open: boolean
  onClose: () => void
  group: GroupChat['group']
  members: ChatMember[]
  /** Tap a row to open that member's profile sheet. */
  onMemberTap: (member: ChatMember) => void
}

/*
  The group's member list, opened from the header's members button. Uses the shared
  Sheet (backdrop + slide-up + a11y) and shows every member with an online dot and
  role. Tapping a row hands off to the per-member profile sheet (MemberSheet).

  Note: unlike the prototype, there's no "Add to chat" here — participants can't
  change the roster (that's an organizer power; see the guardrails). This is a
  read-only roster view.
*/
export function MembersSheet({ open, onClose, group, members, onMemberTap }: Props) {
  const { t } = useTranslation()

  return (
    <Sheet
      open={open}
      onClose={onClose}
      closeLabel={t.notfound.back}
      title={group.name}
      subtitle={interpolate(t.chat.membersOnline, {
        members: group.memberCount,
        online: group.onlineCount,
      })}
      className="max-h-[78%] overflow-y-auto"
    >
      <div className="flex flex-col">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onMemberTap(m)}
            className="flex items-center gap-3 py-2 text-left transition-colors active:bg-soft"
          >
            <span className="relative flex-none">
              <Avatar
                name={m.name}
                initials={m.initials}
                photo={m.photo}
                color={m.color}
                size={42}
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-2 ${
                  m.online ? 'bg-pine' : 'bg-muted'
                }`}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-title font-semibold text-content">{m.name}</div>
              <div className="text-caption text-muted">
                {m.role === 'leader' ? t.chat.leaderRole : t.chat.memberRole}
              </div>
            </div>
            {m.role === 'leader' && <Badge tone="amber">★ {t.chat.leaderBadge}</Badge>}
            {m.isMe && <Badge tone="pine">{t.chat.you}</Badge>}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
