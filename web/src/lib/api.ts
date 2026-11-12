export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** A task exactly as returned by the NestJS API (dates are ISO strings). */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
}

/** Body accepted by POST /tasks and PATCH /tasks/:id. */
export interface TaskInput {
  title: string;
  description: string | null;
  status: TaskStatus;
  /** ISO date string (e.g. "2026-12-31"), or null for no due date. */
  dueDate: string | null;
}

export type TaskSortField = "createdAt" | "dueDate";
export type SortOrder = "asc" | "desc";

/** Query options for GET /tasks (see the API's QueryTasksDto). */
export interface ListTasksParams {
  status?: TaskStatus;
  sort?: TaskSortField;
  order?: SortOrder;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Error thrown for any failed API call. `status` is 0 when the server is unreachable. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Nest returns `message` as a string or, for validation errors, a string[]. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const message: unknown = body?.message;
    if (Array.isArray(message)) return message.join(". ");
    if (typeof message === "string") return message;
  } catch {
    // The body was not JSON; fall through to the generic message.
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Could not reach the server. Check that the API is running and try again.",
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const tasksApi = {
  list: (params: ListTasksParams = {}, signal?: AbortSignal) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    const queryString = query.toString();
    return request<Task[]>(`/tasks${queryString ? `?${queryString}` : ""}`, {
      signal,
    });
  },

  create: (input: TaskInput) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }),

  update: (id: number, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  remove: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
