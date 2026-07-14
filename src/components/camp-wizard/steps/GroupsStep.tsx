import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { Skeleton } from '../../ui'
import { CAMP_GROUPS } from '../../../lib/groups'
import {
  useCampGroups,
  useCreateGroup,
  useDeleteGroup,
} from '../../../api/queries/campGroups.queries'

export function GroupsStep({ campId }: { campId: string }) {
  const { t } = useTranslation()
  const w = t.campWizard
  const groups = useCampGroups(campId)
  const createGroup = useCreateGroup(campId)
  const deleteGroup = useDeleteGroup(campId)
  const [name, setName] = useState('')

  const list = groups.data ?? []

  const add = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const color = CAMP_GROUPS[list.length % CAMP_GROUPS.length].color
    createGroup.mutate({ name: trimmed, color }, { onSuccess: () => setName('') })
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.groupsTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.groupsHint}</p>
      </div>

      {groups.isPending ? (
        <Skeleton className="h-16" tone="surface" />
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-input border border-line bg-surface px-3 py-2.5"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-green-tint text-body">
                🏕
              </span>
              <span className="flex-1 truncate text-body font-semibold text-content">{g.name}</span>
              <button
                type="button"
                aria-label={w.remove}
                onClick={() => deleteGroup.mutate(g.id)}
                className="flex-none px-2 text-subhead text-muted active:scale-90"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-input border border-dashed border-line bg-soft px-3 py-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={w.groupNamePlaceholder}
          className="min-w-0 flex-1 bg-transparent py-2 text-body text-content outline-none"
        />
        <button
          type="button"
          onClick={add}
          disabled={!name.trim() || createGroup.isPending}
          className="flex-none rounded-input bg-pine px-3.5 py-2 text-caption font-bold text-white disabled:opacity-50 active:scale-95"
        >
          {w.addGroup}
        </button>
      </div>

      <p className="rounded-input bg-soft px-3.5 py-2.5 text-caption text-muted">
        {interpolate(w.groupCount, { count: list.length })}
      </p>
    </div>
  )
}
