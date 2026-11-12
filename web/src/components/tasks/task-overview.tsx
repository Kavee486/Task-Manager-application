"use client";

import {
  CheckCircle2Icon,
  CircleDashedIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "@/components/animated-number";
import type { Task, TaskStatus } from "@/lib/api";
import { getDueState } from "@/lib/tasks";
import { cn } from "@/lib/utils";

const STAT_CARDS: {
  status: TaskStatus;
  label: string;
  icon: LucideIcon;
  tint: string;
}[] = [
  {
    status: "TODO",
    label: "To do",
    icon: CircleDashedIcon,
    tint: "bg-slate-500/12 text-slate-600 dark:text-slate-300",
  },
  {
    status: "IN_PROGRESS",
    label: "In progress",
    icon: LoaderCircleIcon,
    tint: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  },
  {
    status: "DONE",
    label: "Done",
    icon: CheckCircle2Icon,
    tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  },
];

const cardClass =
  "rounded-2xl border bg-card/70 shadow-sm backdrop-blur transition-shadow hover:shadow-md";

const fadeUp = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: index * 0.07, ease: "easeOut" as const },
});

/** Progress ring plus one card per status. */
export function TaskOverview({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  const overdue = tasks.filter(
    (task) => getDueState(task) === "overdue",
  ).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section
      aria-label="Task overview"
      className="grid gap-3 lg:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]"
    >
      <motion.div
        {...fadeUp(0)}
        className={cn(cardClass, "flex items-center gap-5 p-5")}
      >
        <ProgressRing percent={percent} />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Overall progress</p>
          <p className="text-lg leading-snug font-semibold">
            {total === 0
              ? "Nothing planned yet"
              : done === total
                ? "All caught up"
                : `${done} of ${total} tasks done`}
          </p>
          {overdue > 0 && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-destructive">
              <TriangleAlertIcon className="size-3.5" />
              {overdue} overdue
            </p>
          )}
        </div>
      </motion.div>

      <dl className="grid grid-cols-3 gap-3 lg:col-span-3">
        {STAT_CARDS.map(({ status, label, icon: Icon, tint }, index) => (
          <motion.div
            key={status}
            {...fadeUp(index + 1)}
            className={cn(cardClass, "flex flex-col justify-between gap-3 p-4")}
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-xl",
                tint,
              )}
            >
              <Icon className="size-[18px]" />
            </div>
            <div>
              <dd className="text-3xl leading-none font-semibold tabular-nums">
                <AnimatedNumber
                  value={tasks.filter((task) => task.status === status).length}
                />
              </dd>
              <dt className="mt-1 text-sm text-muted-foreground">{label}</dt>
            </div>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative size-20 shrink-0"
      role="img"
      aria-label={`${percent}% of tasks done`}
    >
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <defs>
          <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 277)" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 215)" />
          </linearGradient>
        </defs>
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke="url(#progress-gradient)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - percent / 100) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center text-base font-semibold tabular-nums"
      >
        <AnimatedNumber value={percent} />%
      </span>
    </div>
  );
}
