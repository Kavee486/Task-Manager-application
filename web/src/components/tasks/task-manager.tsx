"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import type { Task } from "@/lib/api";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskFormDialog, type SaveMode } from "./task-form-dialog";
import { TaskSummary } from "./task-summary";
import { TasksEmpty } from "./tasks-empty";
import { TasksError } from "./tasks-error";
import { TasksSkeleton } from "./tasks-skeleton";
import { TasksTable } from "./tasks-table";

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

export function TaskManager() {
  const { state, reload, refresh } = useTasks();
  const [formDialog, setFormDialog] = useState<FormDialogState>({
    open: false,
    task: null,
    key: 0,
  });

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    task: null,
  });

  const openForm = (task: Task | null) =>
    setFormDialog((current) => ({ open: true, task, key: current.key + 1 }));

  const handleSaved = (task: Task, mode: SaveMode) => {
    setFormDialog((current) => ({ ...current, open: false }));
    toast.success(mode === "created" ? "Task created" : "Task updated", {
      description: task.title,
    });
    refresh();
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

  return (
    <>
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
    </>
  );

  function renderContent() {
    if (state.status === "loading") return <TasksSkeleton />;
    if (state.status === "error") {
      return <TasksError message={state.message} onRetry={reload} />;
    }

    return (
      <div className="flex flex-col gap-6">
        <TaskSummary tasks={state.tasks} />
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Your tasks</h2>
          <Button onClick={() => openForm(null)}>
            <PlusIcon data-icon="inline-start" />
            New task
          </Button>
        </div>
        {state.tasks.length === 0 ? (
          <TasksEmpty onCreate={() => openForm(null)} />
        ) : (
          <TasksTable
            tasks={state.tasks}
            onEdit={openForm}
            onDelete={(task) => setDeleteDialog({ open: true, task })}
          />
        )}
      </div>
    );
  }
}
