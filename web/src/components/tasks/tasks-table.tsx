"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Task, TaskStatus } from "@/lib/api";
import { formatDate, getDueState } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { StatusMenu } from "./status-menu";

const MotionRow = motion.create(TableRow);

interface TasksTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

export function TasksTable({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}: TasksTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card/70 shadow-sm backdrop-blur">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[45%]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Due date</TableHead>
            <TableHead className="hidden sm:table-cell">Created</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {tasks.map((task, index) => (
              <MotionRow
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: Math.min(index, 8) * 0.04 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                <TableCell className="max-w-0 whitespace-normal">
                  <p
                    className={cn(
                      "truncate font-medium",
                      task.status === "DONE" &&
                        "text-muted-foreground line-through decoration-muted-foreground/50",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="truncate text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                  {/* On phones the Due date column is hidden; show it here. */}
                  <div className="mt-1 text-sm sm:hidden">
                    <DueDate task={task} />
                  </div>
                </TableCell>
                <TableCell>
                  <StatusMenu task={task} onChange={onStatusChange} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
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
              </MotionRow>
            ))}
          </AnimatePresence>
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
          dueState === "today" &&
            "font-medium text-amber-700 dark:text-amber-400",
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
