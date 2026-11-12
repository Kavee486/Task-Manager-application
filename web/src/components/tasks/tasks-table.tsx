import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task } from "@/lib/api";
import { formatDate } from "@/lib/tasks";
import { StatusBadge } from "./status-badge";

export function TasksTable({ tasks }: { tasks: Task[] }) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="max-w-0 whitespace-normal">
                <p className="truncate font-medium">{task.title}</p>
                {task.description && (
                  <p className="truncate text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell>
                {formatDate(task.dueDate) ?? (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {formatDate(task.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
