/*
  Loading placeholder for Ranks. Mirrors the real layout — green podium band +
  a stack of rows — so nothing shifts when the data lands. With mock data this
  flashes by; against a real network it's the camper's first frame.
*/
export function RanksSkeleton() {
  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="h-[188px] bg-[linear-gradient(160deg,#0f6b4f_0%,#0a5039_55%,#083b2b_100%)]" />
      <div className="flex animate-pulse flex-col gap-2.5 px-[18px] pt-4">
        <div className="h-[92px] rounded-[20px] bg-surface" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[62px] rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  )
}
