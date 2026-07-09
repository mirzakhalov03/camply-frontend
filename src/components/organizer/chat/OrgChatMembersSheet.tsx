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
}: {
  open: boolean
  onClose: () => void
  title: string
  members: ChatMember[]
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
          <div key={m.id} className="flex items-center gap-3 py-2">
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
          </div>
        ))}
      </div>
    </Sheet>
  )
}
