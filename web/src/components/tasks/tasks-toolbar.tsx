"use client";

import { SearchIcon } from "lucide-react";
import type { RefObject } from "react";
import { Input } from "@/components/ui/input";
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
  query: string;
  onQueryChange: (query: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
}

export function TasksToolbar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  query,
  onQueryChange,
  searchRef,
}: TasksToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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

      <div className="relative min-w-0 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
          className="h-9 bg-card/60 pr-9 pl-8 backdrop-blur"
        />
        <kbd
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 items-center rounded border bg-muted px-1.5 font-mono text-[11px] text-muted-foreground sm:flex"
        >
          /
        </kbd>
      </div>

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
          <SelectTrigger
            aria-labelledby="sort-label"
            className="h-9 w-44 bg-card/60 backdrop-blur"
          >
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
