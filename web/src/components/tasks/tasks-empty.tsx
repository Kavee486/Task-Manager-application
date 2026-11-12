import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TasksEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card/60 px-6 py-16 backdrop-blur text-center">
      <div className="mb-1 flex size-14 items-center justify-center rounded-2xl bg-accent">
        <ClipboardListIcon className="size-7 text-primary" />
      </div>
      <h2 className="font-medium">No tasks yet</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Tasks you create will show up here, along with their status and due
        date.
      </p>
      <Button onClick={onCreate} className="mt-3">
        <PlusIcon data-icon="inline-start" />
        Create your first task
      </Button>
    </div>
  );
}
