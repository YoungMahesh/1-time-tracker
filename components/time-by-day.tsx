"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { formatDuration } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/db";

interface DayTotal {
  date: string;
  label: string;
  totalMinutes: number;
}

function getAllDaysWithTotals(tasks: Task[]): DayTotal[] {
  const groups: Map<string, DayTotal> = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const task of tasks) {
    for (const log of task.logs) {
      const logDate = new Date(log.startTimestamp);
      logDate.setHours(0, 0, 0, 0);
      const dateKey = logDate.toISOString();

      const label =
        logDate.getTime() === today.getTime()
          ? "Today"
          : logDate.getTime() === yesterday.getTime()
            ? "Yesterday"
            : logDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

      if (!groups.has(dateKey)) {
        groups.set(dateKey, { date: dateKey, label, totalMinutes: 0 });
      }
      const group = groups.get(dateKey)!;

      if (log.endTimestamp !== null && log.minutesSpent !== null) {
        group.totalMinutes += log.minutesSpent;
      } else if (log.endTimestamp === null) {
        const liveSeconds = (Date.now() - log.startTimestamp) / 1000;
        group.totalMinutes += liveSeconds / 60;
      }
    }
  }

  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

interface TimeByDayProps {
  tasks: Task[];
}

export function TimeByDay({ tasks }: TimeByDayProps) {
  const days = getAllDaysWithTotals(tasks);
  const [expanded, setExpanded] = useState(false);

  if (days.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 w-full px-4 py-3 hover:no-underline"
      >
        <ChevronRight
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-150",
            expanded && "rotate-90",
          )}
        />
        <span className="text-base font-semibold text-foreground">
          Time by Day
        </span>
        <span className="text-xs text-muted-foreground/50">
          ({days.length})
        </span>
      </button>
      <div className="px-4 pb-4">
        <div className="flex flex-col gap-1">
          {(expanded ? days : days.slice(0, 1)).map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between py-1.5 text-base"
            >
              <span className="text-muted-foreground">{day.label}</span>
              <span className="font-mono tabular-nums text-foreground/80">
                {formatDuration(day.totalMinutes)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
