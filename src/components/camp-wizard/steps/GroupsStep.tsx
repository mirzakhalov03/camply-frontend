import { useState } from 'react'
import { useTranslation } from '../../../i18n/useTranslation'
import { interpolate } from '@/utils/interpolate'
import { useCampDraftStore } from '../../../store/useCampDraftStore'

export function GroupsStep() {
  const { t } = useTranslation()
  const w = t.campWizard
  const groups = useCampDraftStore((s) => s.groups)
  const addGroup = useCampDraftStore((s) => s.addGroup)
  const removeGroup = useCampDraftStore((s) => s.removeGroup)
  const [name, setName] = useState('')

  const add = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    addGroup(trimmed)
    setName('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-title font-bold text-content">{w.groupsTitle}</h2>
        <p className="mt-1 text-caption text-muted">{w.groupsHint}</p>
      </div>

      <div className="flex flex-col gap-2">
        {groups.map((g) => (
          <div
            key={g.tempId}
            className="flex items-center gap-3 rounded-input border border-line bg-surface px-3 py-2.5"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-input bg-green-tint text-body">
              🏕
            </span>
            <span className="flex-1 truncate text-body font-semibold text-content">{g.name}</span>
            <button
              type="button"
              aria-label={w.remove}
              onClick={() => removeGroup(g.tempId)}
              className="flex-none px-2 text-subhead text-muted active:scale-90"
            >
              ×
            </button>
          </div>
        ))}
      </div>

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
          disabled={!name.trim()}
          className="flex-none rounded-input bg-pine px-3.5 py-2 text-caption font-bold text-white disabled:opacity-50 active:scale-95"
        >
          {w.addGroup}
        </button>
      </div>

      <p className="rounded-input bg-soft px-3.5 py-2.5 text-caption text-muted">
        {interpolate(w.groupCount, { count: groups.length })}
      </p>
    </div>
  )
}
