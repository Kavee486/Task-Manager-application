"use client";

import { useCallback, useEffect, useState } from "react";
import { tasksApi, type ListTasksParams, type Task } from "@/lib/api";

type TasksState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; tasks: Task[]; queryKey: string };

/**
 * Loads the task list for the given sort options.
 * - `reload` shows the loading state again (used by the retry button).
 * - `refresh` refetches in the background, keeping the current list on screen
 *   (used after creating, editing or deleting a task).
 * - `isRefetching` is true while a background fetch (refresh or a changed
 *   sort) is in flight, so the UI can dim the stale list instead of flashing.
 */
export function useTasks({ sort, order }: ListTasksParams = {}) {
  const [state, setState] = useState<TasksState>({ status: "loading" });
  const [fetchKey, setFetchKey] = useState(0);
  const queryKey = `${sort ?? ""}|${order ?? ""}|${fetchKey}`;

  useEffect(() => {
    const controller = new AbortController();

    tasksApi
      .list({ sort, order }, controller.signal)
      .then((tasks) => setState({ status: "success", tasks, queryKey }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      });

    return () => controller.abort();
  }, [sort, order, queryKey]);

  const refresh = useCallback(() => setFetchKey((key) => key + 1), []);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    refresh();
  }, [refresh]);

  const isRefetching = state.status === "success" && state.queryKey !== queryKey;

  return { state, isRefetching, reload, refresh };
}
