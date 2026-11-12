import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/tasks";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<TaskStatus, { badge: string; dot: string }> = {
  TODO: {
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  IN_PROGRESS: {
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  DONE: {
    badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles = STATUS_STYLES[status];

  return (
    <Badge variant="secondary" className={cn("gap-1.5", styles.badge)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", styles.dot)} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
