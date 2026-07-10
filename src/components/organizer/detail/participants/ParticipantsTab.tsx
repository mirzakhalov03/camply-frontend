import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { interpolate } from '../../../../lib/interpolate'
import { useRoster } from '../../../../api/queries/roster.queries'
import type { RosterParticipant } from '../../../../api/services/roster.service'
import { useCampDetail } from '../campDetailContext'
import { RosterRow } from './RosterRow'
import { ParticipantPeekSheet } from './ParticipantPeekSheet'

/*
  Participants tab — the camp roster with client-side search (name / group / city).
  Search is a pure filter over the cached list, so it's instant and offline-safe;
  no per-keystroke request. Loading/empty/no-results states per ReadyProduct §9.
*/
export function ParticipantsTab() {
  const { camp } = useCampDetail()
  const { t } = useTranslation()
  const d = t.org.detail
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  // Which participant's peek sheet is open (null = closed).
  const [selected, setSelected] = useState<RosterParticipant | null>(null)
  const rosterQuery = useRoster(camp.id)

  const filtered = useMemo(() => {
    const list = rosterQuery.data ?? []
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((p) =>
      [p.name, p.groupName ?? '', p.city].some((field) => field.toLowerCase().includes(q)),
    )
  }, [rosterQuery.data, query])

  if (rosterQuery.isPending) return <RosterSkeleton />
  if (rosterQuery.isError) {
    return <p className="py-8 text-center text-body text-muted">{d.loadError}</p>
  }

  return (
    <div className="flex flex-col gap-2 pt-1">
      {/* Search */}
      <label className="mb-1 flex items-center gap-2.5 rounded-input border border-line bg-surface px-3.5 py-2.5">
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={interpolate(d.searchParticipants, { count: rosterQuery.data.length })}
          className="min-w-0 flex-1 bg-transparent text-body text-content outline-none placeholder:text-muted"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body text-muted">{d.noResults}</p>
      ) : (
        filtered.map((p) => <RosterRow key={p.id} p={p} onSelect={setSelected} />)
      )}

      <ParticipantPeekSheet
        participant={selected}
        onClose={() => setSelected(null)}
        onSeeOnMap={(p) => {
          setSelected(null)
          // Map tab is a real route (still a placeholder today); the `focus` param
          // lets it centre on this participant once the live map is built.
          navigate(`../map?focus=${p.id}`)
        }}
      />
    </div>
  )
}

function RosterSkeleton() {
  return (
    <div className="flex flex-col gap-2 pt-1">
      <Skeleton className="mb-1 h-11" tone="surface" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16" tone="surface" />
      ))}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="flex-none text-muted"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" strokeLinecap="round" />
    </svg>
  )
}
