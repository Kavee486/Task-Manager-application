import type { ListTasksParams, Task, TaskStatus } from "@/lib/api";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  // Due dates are stored as UTC midnight, so format in UTC to avoid the
  // displayed day shifting in timezones behind UTC.
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string | null {
  return iso ? dateFormatter.format(new Date(iso)) : null;
}

export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 1000;

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  /** yyyy-mm-dd, as used by <input type="date">; empty means no due date. */
  dueDate: string;
}

export type TaskFormErrors = Partial<Record<"title" | "description", string>>;

/** Mirrors the API's validation so mistakes are caught before a request. */
export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }
  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
  }
  return errors;
}

export type StatusFilter = TaskStatus | "ALL";

export const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: STATUS_LABELS.TODO },
  { value: "IN_PROGRESS", label: STATUS_LABELS.IN_PROGRESS },
  { value: "DONE", label: STATUS_LABELS.DONE },
];

export type SortKey = "newest" | "due-asc" | "due-desc";

export const SORT_OPTIONS: {
  value: SortKey;
  label: string;
  params: ListTasksParams;
}[] = [
  {
    value: "newest",
    label: "Newest first",
    params: { sort: "createdAt", order: "desc" },
  },
  {
    value: "due-asc",
    label: "Due date: soonest",
    params: { sort: "dueDate", order: "asc" },
  },
  {
    value: "due-desc",
    label: "Due date: latest",
    params: { sort: "dueDate", order: "desc" },
  },
];

export type DueState = "overdue" | "today" | null;

const pad = (value: number) => String(value).padStart(2, "0");

/** Today's date in the user's timezone, as yyyy-mm-dd. */
function localToday(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Whether a task is overdue or due today. Finished tasks are never flagged.
 * Due dates are plain calendar dates, so compare yyyy-mm-dd strings.
 */
export function getDueState(
  task: Pick<Task, "dueDate" | "status">,
  today = localToday(),
): DueState {
  if (!task.dueDate || task.status === "DONE") return null;
  const due = task.dueDate.slice(0, 10);
  if (due < today) return "overdue";
  if (due === today) return "today";
  return null;
}
