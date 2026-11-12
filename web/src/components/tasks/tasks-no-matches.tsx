import { FilterXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TasksNoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card/60 px-6 py-12 backdrop-blur text-center">
      <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-muted">
        <FilterXIcon className="size-5 text-muted-foreground" />
      </div>
      <h2 className="font-medium">No matching tasks</h2>
      <p className="text-sm text-muted-foreground">
        Try a different search or status, or show every task.
      </p>
      <Button variant="outline" onClick={onClear} className="mt-2">
        Clear filters
      </Button>
    </div>
  );
}
