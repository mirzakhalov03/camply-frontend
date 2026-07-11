import { CAMP_GROUPS } from '../../../lib/groups'

/*
  Audience selector shared by the "add activity" and "compose announcement" forms —
  pick the whole camp or one group. The scope shape matches BOTH Activity['scope']
  and Announcement['scope'] (structurally identical), so one picker serves both.
*/
export type AudienceScope = { kind: 'camp' } | { kind: 'group'; groupId: string; groupName: string }

export function AudiencePicker({
  value,
  onChange,
  allCampLabel,
}: {
  value: AudienceScope
  onChange: (scope: AudienceScope) => void
  allCampLabel: string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={value.kind === 'camp'} onClick={() => onChange({ kind: 'camp' })}>
        {allCampLabel}
      </Chip>
      {CAMP_GROUPS.map((g) => (
        <Chip
          key={g.id}
          active={value.kind === 'group' && value.groupId === g.id}
          color={g.color}
          onClick={() => onChange({ kind: 'group', groupId: g.id, groupName: g.name })}
        >
          {g.name}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption font-semibold transition ${
        active
          ? 'border-pine bg-pine text-white'
          : 'border-line bg-surface text-muted hover:text-content'
      }`}
    >
      {color ? (
        <span className="h-2 w-2 flex-none rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {children}
    </button>
  )
}
