import { Sheet, Avatar } from '../../ui'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '../../../lib/interpolate'
import type { ChatMember } from '../../../lib/chat'

/*
  The channel's members, in a bottom sheet. Presence dot + name; reuses the shared
  Sheet primitive (focus/Escape handling in one place). Purely presentational.
*/
export function OrgChatMembersSheet({
  open,
  onClose,
  title,
  members,
  onMemberTap,
}: {
  open: boolean
  onClose: () => void
  title: string
  members: ChatMember[]
  /** Open a member's profile peek. */
  onMemberTap: (member: ChatMember) => void
}) {
  const { t } = useTranslation()

  return (
    <Sheet
      open={open}
      onClose={onClose}
      closeLabel={t.org.detail.back}
      title={title}
      subtitle={interpolate(t.org.detail.members, { count: members.length })}
      className="max-h-[78%] overflow-y-auto"
    >
      <div className="flex flex-col gap-0.5">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onMemberTap(m)}
            className="flex items-center gap-3 rounded-input py-2 text-left transition active:scale-[0.99]"
          >
            <div className="relative flex-none">
              <Avatar
                name={m.name}
                initials={m.initials}
                color={m.color}
                photo={m.photo}
                size="sm"
              />
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-2 ${
                  m.online ? 'bg-pine' : 'bg-muted'
                }`}
              />
            </div>
            <span className="flex-1 truncate text-title font-semibold text-content">{m.name}</span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
