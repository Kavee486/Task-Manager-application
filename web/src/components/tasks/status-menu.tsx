"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/tasks";
import { StatusBadge } from "./status-badge";

interface StatusMenuProps {
  task: Task;
  onChange: (task: Task, status: TaskStatus) => void;
}

/** The status badge, doubling as a dropdown to change the status in one click. */
export function StatusMenu({ task, onChange }: StatusMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Change status of ${task.title}. Currently ${STATUS_LABELS[task.status]}`}
            className="group inline-flex items-center gap-0.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <StatusBadge status={task.status} />
        <ChevronDownIcon className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-40">
        <DropdownMenuRadioGroup
          value={task.status}
          onValueChange={(value) => onChange(task, value as TaskStatus)}
        >
          {TASK_STATUSES.map((status) => (
            <DropdownMenuRadioItem key={status} value={status} closeOnClick>
              {STATUS_LABELS[status]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
