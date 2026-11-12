"use client";

import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUSES, tasksApi, type Task, type TaskStatus } from "@/lib/api";
import {
  STATUS_LABELS,
  validateTaskForm,
  type TaskFormValues,
} from "@/lib/tasks";

const STATUS_ITEMS = TASK_STATUSES.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
}));

export type SaveMode = "created" | "updated";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The task being edited, or null when creating a new one. */
  task: Task | null;
  /** Changes every time the dialog is opened, so the form starts fresh. */
  formKey: number;
  onSaved: (task: Task, mode: SaveMode) => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  formKey,
  onSaved,
}: TaskFormDialogProps) {
  const isEdit = task !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this task."
              : "Add a task to your list."}
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          key={formKey}
          task={task}
          onCancel={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TaskFormProps {
  task: Task | null;
  onCancel: () => void;
  onSaved: TaskFormDialogProps["onSaved"];
}

function TaskForm({ task, onCancel, onSaved }: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "TODO",
    dueDate: task?.dueDate?.slice(0, 10) ?? "",
  });
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = showErrors ? validateTaskForm(values) : {};

  function setValue<K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    if (Object.keys(validateTaskForm(values)).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const input = {
        title: values.title.trim(),
        description: values.description.trim() || null,
        status: values.status,
        dueDate: values.dueDate || null,
      };
      const saved = task
        ? await tasksApi.update(task.id, input)
        : await tasksApi.create(input);
      onSaved(saved, task ? "updated" : "created");
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          autoFocus
          value={values.title}
          onChange={(event) => setValue("title", event.target.value)}
          placeholder="e.g. Prepare the sprint demo"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "task-title-error" : undefined}
        />
        {errors.title && (
          <p id="task-title-error" className="text-sm text-destructive">
            {errors.title}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-description">
          Description{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="task-description"
          value={values.description}
          onChange={(event) => setValue("description", event.target.value)}
          placeholder="Add any details you want to remember"
          rows={3}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "task-description-error" : undefined
          }
        />
        {errors.description && (
          <p id="task-description-error" className="text-sm text-destructive">
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-status">Status</Label>
          <Select
            items={STATUS_ITEMS}
            value={values.status}
            onValueChange={(value) => {
              if (value) setValue("status", value as TaskStatus);
            }}
          >
            <SelectTrigger id="task-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ITEMS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-due-date">
            Due date{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="task-due-date"
            type="date"
            value={values.dueDate}
            onChange={(event) => setValue("dueDate", event.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : task ? "Save changes" : "Create task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
