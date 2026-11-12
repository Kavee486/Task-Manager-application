import { Skeleton } from "@/components/ui/skeleton";

export function TasksSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading tasks"
      className="divide-y rounded-xl border bg-card"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 p-4">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
        </div>
      ))}
    </div>
  );
}
