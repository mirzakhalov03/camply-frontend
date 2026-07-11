import { Avatar } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { interpolate } from '../../../../lib/interpolate'
import type { CampGroupDetail } from '../../../../api/services/campGroups.service'

/*
  One group on the Groups tab: a colored dot + name + member count, then member
  chips. The leader's chip is highlighted (👑) — every group has one leader
  (Context.md §6). Group color is runtime data, applied inline.
*/
export function GroupCard({ group }: { group: CampGroupDetail }) {
  const { t } = useTranslation()
  const d = t.org.detail

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-[0_3px_12px_rgba(20,40,30,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 flex-none rounded-full"
            style={{ backgroundColor: group.color }}
          />
          <span className="truncate text-title font-bold text-content">{group.name}</span>
        </div>
        <span className="flex-none rounded-full bg-green-tint px-2.5 py-1 text-meta font-bold text-pine">
          {interpolate(d.members, { count: group.memberCount })}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {group.members.map((m) => (
          <span
            key={m.id}
            className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 ${
              m.isLeader ? 'bg-green-tint' : 'bg-soft'
            }`}
            title={m.isLeader ? d.leader : undefined}
          >
            <Avatar
              name={m.name}
              initials={m.initials}
              color={m.avatarColor}
              photo={m.photo}
              size="xs"
            />
            <span className="text-caption font-semibold text-content">
              {m.name.split(' ')[0]}
              {m.isLeader ? ' 👑' : ''}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
