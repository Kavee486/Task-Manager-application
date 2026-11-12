import type { TaskStatus } from "@/lib/api";

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
