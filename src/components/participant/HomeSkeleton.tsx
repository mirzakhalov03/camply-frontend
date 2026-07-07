/*
  Loading placeholder for Home. It mirrors the real layout (cover + four card
  blocks) so nothing shifts when the data arrives. `animate-pulse` is Tailwind's
  built-in shimmer. With mock data this flashes by; against a real network it's
  what the camper sees for the first moment.
*/
export function HomeSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="h-52 bg-[linear-gradient(160deg,#0f6b4f_0%,#0a5039_55%,#083b2b_100%)]" />
      <div className="flex animate-pulse flex-col gap-3.5 px-[18px] pt-4">
        <div className="h-[84px] rounded-[20px] bg-surface" />
        <div className="h-6 w-40 rounded-full bg-surface" />
        <div className="h-[220px] rounded-[20px] bg-surface" />
        <div className="h-6 w-44 rounded-full bg-surface" />
        <div className="h-[104px] rounded-[20px] bg-surface" />
        <div className="h-[74px] rounded-[20px] bg-surface" />
      </div>
    </div>
  )
}
