import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task } from "@/lib/api";
import { formatDate, getDueState } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./status-badge";

interface TasksTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TasksTable({ tasks, onEdit, onDelete }: TasksTableProps) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
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
                <DueDate task={task} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {formatDate(task.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(task)}
                    aria-label={`Edit task: ${task.title}`}
                    title="Edit task"
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(task)}
                    aria-label={`Delete task: ${task.title}`}
                    title="Delete task"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DueDate({ task }: { task: Task }) {
  const formatted = formatDate(task.dueDate);
  if (!formatted) {
    return <span className="text-muted-foreground">No due date</span>;
  }

  const dueState = getDueState(task);
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          dueState === "overdue" && "font-medium text-destructive",
          dueState === "today" && "font-medium text-amber-700 dark:text-amber-400",
        )}
      >
        {formatted}
      </span>
      {dueState && (
        <span
          className={cn(
            "text-xs",
            dueState === "overdue"
              ? "text-destructive"
              : "text-amber-700 dark:text-amber-400",
          )}
        >
          {dueState === "overdue" ? "Overdue" : "Due today"}
        </span>
      )}
    </div>
  );
}
