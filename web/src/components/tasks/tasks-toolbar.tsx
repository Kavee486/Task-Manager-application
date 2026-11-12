"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FILTER_OPTIONS,
  SORT_OPTIONS,
  type SortKey,
  type StatusFilter,
} from "@/lib/tasks";

interface TasksToolbarProps {
  filter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export function TasksToolbar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: TasksToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={filter}
        onValueChange={(value) => onFilterChange(value as StatusFilter)}
      >
        <TabsList aria-label="Filter tasks by status">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} className="px-3">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <span id="sort-label" className="text-sm text-muted-foreground">
          Sort by
        </span>
        <Select
          items={SORT_OPTIONS}
          value={sort}
          onValueChange={(value) => {
            if (value) onSortChange(value as SortKey);
          }}
        >
          <SelectTrigger aria-labelledby="sort-label" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
