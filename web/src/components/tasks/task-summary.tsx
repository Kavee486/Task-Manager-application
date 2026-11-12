import { TASK_STATUSES, type Task } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/tasks";

/** Small row of counters: total plus one per status. */
export function TaskSummary({ tasks }: { tasks: Task[] }) {
  const items = [
    { label: "Total", value: tasks.length },
    ...TASK_STATUSES.map((status) => ({
      label: STATUS_LABELS[status],
      value: tasks.filter((task) => task.status === status).length,
    })),
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value }) => (
        <div key={label} className="rounded-xl border bg-card px-4 py-3">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
