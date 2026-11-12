"use client";

import { useTasks } from "@/hooks/use-tasks";
import { TaskSummary } from "./task-summary";
import { TasksEmpty } from "./tasks-empty";
import { TasksError } from "./tasks-error";
import { TasksSkeleton } from "./tasks-skeleton";
import { TasksTable } from "./tasks-table";

export function TaskManager() {
  const { state, reload } = useTasks();

  if (state.status === "loading") return <TasksSkeleton />;
  if (state.status === "error") {
    return <TasksError message={state.message} onRetry={reload} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <TaskSummary tasks={state.tasks} />
      {state.tasks.length === 0 ? (
        <TasksEmpty />
      ) : (
        <TasksTable tasks={state.tasks} />
      )}
    </div>
  );
}
