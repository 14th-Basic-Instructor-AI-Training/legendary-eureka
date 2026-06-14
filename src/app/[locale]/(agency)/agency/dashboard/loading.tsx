import { Skeleton } from "@/ui";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 px-8 py-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-48 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[3fr_2fr] gap-6">
        <Skeleton className="h-[268px] rounded-2xl" />
        <Skeleton className="h-[268px] rounded-2xl" />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-[320px] rounded-2xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-36 rounded-lg" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <Skeleton className="h-[196px] rounded-2xl" />
    </div>
  );
}
