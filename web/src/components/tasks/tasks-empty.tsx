import { ClipboardListIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TasksEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-muted">
        <ClipboardListIcon className="size-6 text-muted-foreground" />
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
