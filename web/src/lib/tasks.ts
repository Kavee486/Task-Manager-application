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
