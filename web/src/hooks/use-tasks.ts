"use client";

import { useCallback, useEffect, useState } from "react";
import { tasksApi, type Task } from "@/lib/api";

type TasksState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; tasks: Task[] };

/** Loads the task list and exposes `reload` to retry or refresh it. */
export function useTasks() {
  const [state, setState] = useState<TasksState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [reloadKey]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setReloadKey((key) => key + 1);
  }, []);

  return { state, reload };
}
