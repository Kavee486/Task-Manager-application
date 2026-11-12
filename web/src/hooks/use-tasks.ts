"use client";

import { useCallback, useEffect, useState } from "react";
import { tasksApi, type Task } from "@/lib/api";

type TasksState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; tasks: Task[] };

/**
 * Loads the task list.
 * - `reload` shows the loading state again (used by the retry button).
 * - `refresh` refetches in the background, keeping the current list on screen
 *   (used after creating, editing or deleting a task).
 */
export function useTasks() {
  const [state, setState] = useState<TasksState>({ status: "loading" });
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    tasksApi
      .list(controller.signal)
      .then((tasks) => setState({ status: "success", tasks }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      });

    return () => controller.abort();
  }, [fetchKey]);

  const refresh = useCallback(() => setFetchKey((key) => key + 1), []);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    refresh();
  }, [refresh]);

  return { state, reload, refresh };
}
