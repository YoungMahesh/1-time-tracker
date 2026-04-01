"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { type TimeLog, formatDuration, formatTimestamp } from "@/lib/db";
import { cn } from "@/lib/utils";

function LogEntry({ log, index }: { log: TimeLog; index: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (log.endTimestamp !== null) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - log.startTimestamp) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [log.startTimestamp, log.endTimestamp]);

  const duration =
    log.endTimestamp !== null
      ? formatDuration(log.minutesSpent ?? 0)
      : formatDuration(elapsed / 60);

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div className="flex flex-col items-center mt-0.5">
        <div
          className={cn(
            "size-2 rounded-full mt-1",
            log.endTimestamp === null
              ? "bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)] animate-pulse"
              : "bg-muted-foreground/30",
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Session #{index + 1}
          </span>
          <span
            className={cn(
              "text-xs font-mono font-bold tabular-nums",
              log.endTimestamp === null
                ? "text-emerald-500"
                : "text-foreground/70",
            )}
          >
            {duration}
          </span>
        </div>
        <div className="text-xs text-muted-foreground/60 mt-0.5 flex items-center gap-1">
          <span>{formatTimestamp(log.startTimestamp)}</span>
          {log.endTimestamp !== null && (
            <>
              <ChevronRight className="size-3 shrink-0" />
              <span>{formatTimestamp(log.endTimestamp)}</span>
            </>
          )}
          {log.endTimestamp === null && (
            <span className="ml-1 text-emerald-500 font-medium">• running</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface GroupedLogs {
  label: string;
  date: string;
  logs: TimeLog[];
}

function groupLogsByDate(logs: TimeLog[]): GroupedLogs[] {
  const groups: Map<string, GroupedLogs> = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const log of logs) {
    const logDate = new Date(log.startTimestamp);
    logDate.setHours(0, 0, 0, 0);
    const dateKey = logDate.toISOString();
    const label =
      logDate.getTime() === today.getTime()
        ? "Today"
        : logDate.getTime() === yesterday.getTime()
          ? "Yesterday"
          : logDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            });

    if (!groups.has(dateKey)) {
      groups.set(dateKey, { label, date: dateKey, logs: [] });
    }
    groups.get(dateKey)!.logs.push(log);
  }

  return Array.from(groups.values());
}

interface SessionLogsProps {
  logs: TimeLog[];
}

export function SessionLogs({ logs }: SessionLogsProps) {
  const grouped = groupLogsByDate([...logs].reverse());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(
    () => new Set(grouped.map((g) => g.date)),
  );

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  if (logs.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground/40">
        No sessions yet. Press play to start tracking.
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto pr-1 -mr-1">
      {grouped.map((group, gi) => (
        <div key={group.date}>
          <button
            onClick={() => toggleDate(group.date)}
            className="flex items-center gap-1.5 w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={cn(
                "size-3.5 transition-transform duration-150",
                expandedDates.has(group.date) && "rotate-90",
              )}
            />
            <span className="uppercase tracking-widest">{group.label}</span>
            <span className="text-muted-foreground/40 ml-1">
              ({group.logs.length})
            </span>
          </button>
          {expandedDates.has(group.date) && (
            <div className="pl-2">
              {group.logs.map((log, i) => {
                const globalIndex = logs.findIndex(
                  (l) => l.startTimestamp === log.startTimestamp,
                );
                return (
                  <LogEntry key={log.startTimestamp} log={log} index={globalIndex} />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
