import { TaskManager } from "@/components/tasks/task-manager";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Task Manager</h1>
        <p className="text-muted-foreground">
          Keep track of what needs doing, what&apos;s underway and what&apos;s
          done.
        </p>
      </header>
      <TaskManager />
    </main>
  );
}
