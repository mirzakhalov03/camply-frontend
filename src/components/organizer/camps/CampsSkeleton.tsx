import { Skeleton } from '../../ui'

/*
  Loading state for the Camps dashboard (ReadyProduct §9 — every screen gets one).
  Mirrors the real layout's rhythm so the swap to content doesn't jump: stat strip,
  a couple of quick-link tiles, then camp cards.
*/
export function CampsSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 px-5 pb-24 pt-4">
      <Skeleton className="h-6 w-40" tone="soft" />
      <div className="flex gap-2.5">
        <Skeleton className="h-20 flex-1" tone="surface" />
        <Skeleton className="h-20 flex-1" tone="surface" />
        <Skeleton className="h-20 flex-1" tone="surface" />
      </div>
      <div className="flex gap-2.5">
        <Skeleton className="h-24 flex-1" tone="surface" />
        <Skeleton className="h-24 flex-1" tone="surface" />
      </div>
      <Skeleton className="h-48" tone="surface" />
      <Skeleton className="h-48" tone="surface" />
    </div>
  )
}
