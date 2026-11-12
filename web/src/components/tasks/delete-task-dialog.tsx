"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError, tasksApi, type Task } from "@/lib/api";

interface DeleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The task awaiting confirmation. Kept while the dialog animates closed. */
  task: Task | null;
  /** Called once the task no longer exists on the server. */
  onDeleted: (task: Task, alreadyGone: boolean) => void;
}

export function DeleteTaskDialog({
  open,
  onOpenChange,
  task,
  onDeleted,
}: DeleteTaskDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (!task) return;
    setDeleting(true);
    try {
      await tasksApi.remove(task.id);
      onDeleted(task, false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        // Deleted elsewhere in the meantime: the goal is already achieved.
        onDeleted(task, true);
      } else {
        toast.error("Couldn't delete the task", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      // Don't let the dialog be dismissed while the request is in flight.
      onOpenChange={(next) => !deleting && onOpenChange(next)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            {task ? (
              <>
                &ldquo;{task.title}&rdquo; will be permanently deleted. This
                can&apos;t be undone.
              </>
            ) : (
              "This task will be permanently deleted."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete task"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
