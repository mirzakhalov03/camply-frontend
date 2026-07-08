import { Skeleton } from '../../ui'

/*
  Loading placeholder for the announcements list — a few card skeletons so the
  layout doesn't jump when the feed arrives (ReadyProduct §9).
*/
export function AnnouncementsSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-[18px] pb-6 pt-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-card border border-line bg-surface p-4">
          <Skeleton className="mb-3 h-4 w-32" tone="soft" />
          <Skeleton className="mb-2 h-3.5 w-full" tone="soft" />
          <Skeleton className="h-3.5 w-2/3" tone="soft" />
          <Skeleton className="mt-3 h-6 w-24 rounded-full" tone="soft" />
        </div>
      ))}
    </div>
  )
}
