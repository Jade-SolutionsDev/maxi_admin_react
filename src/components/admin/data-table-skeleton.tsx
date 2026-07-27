import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Generic loading placeholder for list tables — a header bar plus shimmering
 * rows. Rendered by DataTable while the list is pending. Reused across every
 * list, so it stays column-count agnostic (defaults suit most tables).
 */
export const DataTableSkeleton = ({
  rows = 8,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) => (
  <div className="rounded-md border border-border overflow-hidden">
    <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-10 shrink-0" : "flex-1")}
        />
      ))}
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn(
                "h-4",
                c === 0 ? "h-9 w-9 shrink-0 rounded-full" : "flex-1",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);
