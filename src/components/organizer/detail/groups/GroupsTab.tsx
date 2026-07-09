import { Skeleton } from '../../../ui'
import { useTranslation } from '../../../../i18n/useTranslation'
import { useCampGroups } from '../../../../api/queries/campGroups.queries'
import { useCampDetail } from '../campDetailContext'
import { GroupCard } from './GroupCard'

/*
  Groups tab — the camp's groups with their members, derived from the same roster
  the Participants tab reads (so counts always agree). Loading/empty/error states
  per ReadyProduct §9.
*/
export function GroupsTab() {
  const { camp } = useCampDetail()
  const { t } = useTranslation()
  const d = t.org.detail
  const groupsQuery = useCampGroups(camp.id)

  if (groupsQuery.isPending) return <GroupsSkeleton />
  if (groupsQuery.isError) {
    return <p className="py-8 text-center text-body text-muted">{d.loadError}</p>
  }
  if (groupsQuery.data.length === 0) {
    return <p className="py-8 text-center text-body text-muted">{d.noMembers}</p>
  }

  return (
    <div className="flex flex-col gap-3 pt-1 md:grid md:grid-cols-2">
      {groupsQuery.data.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  )
}

function GroupsSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-1 md:grid md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" tone="surface" />
      ))}
    </div>
  )
}
