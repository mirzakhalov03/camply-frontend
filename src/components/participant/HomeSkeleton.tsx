import { Skeleton } from '../ui'

/*
  Loading placeholder for Home. It mirrors the real layout (cover + four card
  blocks) so nothing shifts when the data arrives. Built from the shared Skeleton
  primitive. With mock data this flashes by; against a real network it's what the
  camper sees for the first moment.
*/
export function HomeSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="h-52 bg-gradient-to-br from-pine to-deep" />
      <div className="flex flex-col gap-3.5 px-[18px] pt-4">
        <Skeleton tone="surface" className="h-[84px] rounded-card" />
        <Skeleton tone="surface" className="h-6 w-40 rounded-full" />
        <Skeleton tone="surface" className="h-[220px] rounded-card" />
        <Skeleton tone="surface" className="h-6 w-44 rounded-full" />
        <Skeleton tone="surface" className="h-[104px] rounded-card" />
        <Skeleton tone="surface" className="h-[74px] rounded-card" />
      </div>
    </div>
  )
}
