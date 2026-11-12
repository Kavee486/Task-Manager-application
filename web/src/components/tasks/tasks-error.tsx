import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TasksErrorProps {
  message: string;
  onRetry: () => void;
}

export function TasksError({ message, onRetry }: TasksErrorProps) {
  return (
    <Alert variant="destructive" className="items-center py-4">
      <TriangleAlertIcon />
      <AlertTitle>Couldn&apos;t load your tasks</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="col-start-2 mt-2 w-fit"
      >
        Try again
      </Button>
    </Alert>
  );
}
