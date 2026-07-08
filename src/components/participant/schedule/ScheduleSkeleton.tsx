import { Skeleton } from '../../ui'

/*
  Loading state for the schedule screen — mirrors HomeSkeleton/RanksSkeleton so the
  layout doesn't jump when data arrives: a day strip of chips + a few timeline rows.
*/
export function ScheduleSkeleton() {
  return (
    <div className="h-full bg-canvas">
      <div className="flex gap-2 px-[18px] pb-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] w-[52px] rounded-input" tone="surface" />
        ))}
      </div>
      <div className="flex flex-col gap-4 px-[18px] pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3.5">
            <Skeleton className="h-4 w-[46px]" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
