import { Skeleton } from '../../ui'

/*
  Loading placeholder for Ranks. Mirrors the real layout — green podium band +
  a stack of rows — so nothing shifts when the data lands, built from the shared
  Skeleton primitive. With mock data this flashes by; against a real network it's
  the camper's first frame.
*/
export function RanksSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="h-[188px] bg-gradient-to-br from-pine to-deep" />
      <div className="flex flex-col gap-2.5 px-[18px] pt-4">
        <Skeleton tone="surface" className="h-[92px] rounded-card" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} tone="surface" className="h-[62px] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
