import { AppHeader } from "@/components/app-header";
import { TaskManager } from "@/components/tasks/task-manager";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:py-12">
      <AppHeader />
      <TaskManager />
    </main>
  );
}
