"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlusIcon } from "lucide-react";
import { MotionConfig } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { tasksApi, type Task, type TaskStatus } from "@/lib/api";
import { celebrate } from "@/lib/celebrate";
import {
  SORT_OPTIONS,
  STATUS_LABELS,
  type SortKey,
  type StatusFilter,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskFormDialog, type SaveMode } from "./task-form-dialog";
import { TaskOverview } from "./task-overview";
import { TasksEmpty } from "./tasks-empty";
import { TasksError } from "./tasks-error";
import { TasksNoMatches } from "./tasks-no-matches";
import { TasksSkeleton } from "./tasks-skeleton";
import { TasksTable } from "./tasks-table";
import { TasksToolbar } from "./tasks-toolbar";

interface FormDialogState {
  open: boolean;
  /** Task being edited, or null when creating. */
  task: Task | null;
  /** Bumped on every open so the form always starts from fresh values. */
  key: number;
}

interface DeleteDialogState {
  open: boolean;
  /** Task awaiting confirmation; kept after closing so the dialog can animate out. */
  task: Task | null;
}

/** True when the keystroke is meant for a text field, menu or dialog. */
function isTypingOrOverlayOpen(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest("input, textarea, select, [contenteditable]")) return true;
  return Boolean(
    document.querySelector(
      "[role=dialog], [role=alertdialog], [role=menu], [role=listbox]",
    ),
  );
}

export function TaskManager() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [sort, setSort] = useState<SortKey>("newest");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { state, isRefetching, reload, refresh } = useTasks(
    SORT_OPTIONS.find((option) => option.value === sort)?.params,
  );
  const [formDialog, setFormDialog] = useState<FormDialogState>({
    open: false,
    task: null,
    key: 0,
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    task: null,
  });

  // Sorting happens on the server; search and the status filter are applied
  // here so the overview always reflects every task.
  const visibleTasks = useMemo(() => {
    if (state.status !== "success") return [];
    const needle = query.trim().toLowerCase();
    return state.tasks.filter(
      (task) =>
        (filter === "ALL" || task.status === filter) &&
        (!needle ||
          task.title.toLowerCase().includes(needle) ||
          task.description?.toLowerCase().includes(needle)),
    );
  }, [state, filter, query]);

  const openForm = useCallback(
    (task: Task | null) =>
      setFormDialog((current) => ({ open: true, task, key: current.key + 1 })),
    [],
  );

  // Keyboard shortcuts: "/" focuses the search box, "n" starts a new task.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingOrOverlayOpen(event)) return;

      if (event.key === "/" && searchRef.current) {
        event.preventDefault();
        searchRef.current.focus();
      } else if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        openForm(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openForm]);

  const handleSaved = (task: Task, mode: SaveMode) => {
    setFormDialog((current) => ({ ...current, open: false }));
    toast.success(mode === "created" ? "Task created" : "Task updated", {
      description: task.title,
    });
    if (task.status === "DONE") void celebrate();
    refresh();
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (status === task.status) return;
    try {
      await tasksApi.update(task.id, { status });
      toast.success(`Moved to ${STATUS_LABELS[status]}`, {
        description: task.title,
      });
      if (status === "DONE") void celebrate();
      refresh();
    } catch (error) {
      toast.error("Couldn't update the task", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  };

  const handleDeleted = (task: Task, alreadyGone: boolean) => {
    setDeleteDialog((current) => ({ ...current, open: false }));
    if (alreadyGone) {
      toast.info("Task was already deleted", { description: task.title });
    } else {
      toast.success("Task deleted", { description: task.title });
    }
    refresh();
  };

  const clearFilters = () => {
    setFilter("ALL");
    setQuery("");
  };

  return (
    <MotionConfig reducedMotion="user">
      <TaskFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((c) => ({ ...c, open }))}
        task={formDialog.task}
        formKey={formDialog.key}
        onSaved={handleSaved}
      />
      <DeleteTaskDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((c) => ({ ...c, open }))}
        task={deleteDialog.task}
        onDeleted={handleDeleted}
      />
      {renderContent()}
    </MotionConfig>
  );

  function renderContent() {
    if (state.status === "loading") return <TasksSkeleton />;
    if (state.status === "error") {
      return <TasksError message={state.message} onRetry={reload} />;
    }

    return (
      <div className="flex flex-col gap-6">
        <TaskOverview tasks={state.tasks} />
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Your tasks</h2>
          <Button onClick={() => openForm(null)}>
            <PlusIcon data-icon="inline-start" />
            New task
            <kbd
              aria-hidden
              className="ml-1 hidden rounded bg-primary-foreground/20 px-1.5 font-mono text-[11px] sm:inline"
            >
              N
            </kbd>
          </Button>
        </div>
        {state.tasks.length === 0 ? (
          <TasksEmpty onCreate={() => openForm(null)} />
        ) : (
          <>
            <TasksToolbar
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              query={query}
              onQueryChange={setQuery}
              searchRef={searchRef}
            />
            {visibleTasks.length === 0 ? (
              <TasksNoMatches onClear={clearFilters} />
            ) : (
              <div
                className={cn(
                  "transition-opacity",
                  isRefetching && "opacity-60",
                )}
                aria-busy={isRefetching}
              >
                <TasksTable
                  tasks={visibleTasks}
                  onEdit={openForm}
                  onDelete={(task) => setDeleteDialog({ open: true, task })}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}
