import { CheckCheckIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30"
        >
          <CheckCheckIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
            Task Manager
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground sm:text-base">
            Plan it, track it, finish it.
          </p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
