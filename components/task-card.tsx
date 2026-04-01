"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Square,
  Trash2,
  Clock,
  Tag,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Task,
  type TimeLog,
  saveTask,
  deleteTask,
  formatDuration,
} from "@/lib/db";
import { cn } from "@/lib/utils";
import { ScreenWakeLock } from "@/components/screen-wake-lock";
import { SessionLogs } from "@/components/session-logs";

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeLog = task.logs.find((l) => l.endTimestamp === null);
  const isRunning = Boolean(activeLog);

  // Live timer tick
  useEffect(() => {
    if (!isRunning || !activeLog) return;
    const interval = setInterval(() => {
      setLiveElapsed(
        Math.floor((Date.now() - activeLog.startTimestamp) / 1000),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, activeLog]);

  // Close popover on outside click
  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popoverOpen]);

  const handleStart = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isRunning) return;
      const newLog: TimeLog = {
        startTimestamp: Date.now(),
        endTimestamp: null,
        minutesSpent: null,
      };
      const updated: Task = { ...task, logs: [...task.logs, newLog] };
      await saveTask(updated);
      onUpdate(updated);
    },
    [task, isRunning, onUpdate],
  );

  const handleStop = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isRunning) return;
      const now = Date.now();
      const updatedLogs: TimeLog[] = task.logs.map((log) => {
        if (log.endTimestamp !== null) return log;
        const minutes = (now - log.startTimestamp) / 1000 / 60;
        return { ...log, endTimestamp: now, minutesSpent: minutes };
      });
      const updated: Task = { ...task, logs: updatedLogs };
      await saveTask(updated);
      onUpdate(updated);
      setLiveElapsed(0);
    },
    [task, isRunning, onUpdate],
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteTask(task.id);
      onDelete(task.id);
    },
    [task.id, onDelete],
  );

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMinutes = task.logs.reduce((acc, log) => {
    const logDate = new Date(log.startTimestamp);
    logDate.setHours(0, 0, 0, 0);
    if (logDate.getTime() === todayStart.getTime() && log.minutesSpent !== null) {
      return acc + log.minutesSpent;
    }
    return acc;
  }, 0);
  const todayLiveTotal = isRunning ? todayMinutes + liveElapsed / 60 : todayMinutes;

  // Color tag for running indicator
  const tagColors = [
    "bg-violet-500/15 text-violet-400",
    "bg-sky-500/15 text-sky-400",
    "bg-emerald-500/15 text-emerald-400",
    "bg-amber-500/15 text-amber-400",
    "bg-rose-500/15 text-rose-400",
    "bg-fuchsia-500/15 text-fuchsia-400",
  ];

  return (
    <div className="relative">
      <ScreenWakeLock isRunning={isRunning} />
      {/* Card */}
      <div
        ref={cardRef}
        onClick={() => setPopoverOpen((prev) => !prev)}
        className={cn(
          "group relative bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 select-none",
          "hover:shadow-md hover:-translate-y-0.5",
          popoverOpen
            ? "border-primary/50 shadow-md shadow-primary/10"
            : "border-border",
          isRunning && "border-emerald-500/40 shadow-emerald-500/10 shadow-md",
        )}
      >
        {/* Running pulse border */}
        {isRunning && (
          <div className="absolute inset-0 rounded-xl border border-emerald-500/30 animate-pulse pointer-events-none" />
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {isRunning && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
              <h3 className="text-sm font-semibold text-foreground truncate">
                {task.name}
              </h3>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.map((tag, i) => (
                  <span
                    key={tag}
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-md font-medium",
                      tagColors[i % tagColors.length],
                    )}
                  >
                    <Tag className="size-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Today's time */}
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground/60 shrink-0" />
              <span className="text-sm font-mono font-bold tabular-nums text-foreground/80">
                {formatDuration(todayLiveTotal)}
              </span>
              <span className="text-xs text-muted-foreground/40">
                ·{" "}
                {task.logs.filter((l) => {
                  const logDate = new Date(l.startTimestamp);
                  logDate.setHours(0, 0, 0, 0);
                  return logDate.getTime() === todayStart.getTime() && l.endTimestamp !== null;
                }).length}{" "}
                session
                {task.logs.filter((l) => {
                  const logDate = new Date(l.startTimestamp);
                  logDate.setHours(0, 0, 0, 0);
                  return logDate.getTime() === todayStart.getTime() && l.endTimestamp !== null;
                }).length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {!isRunning ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleStart}
                title="Start timer"
                className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
              >
                <Play className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleStop}
                title="Stop timer"
                className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
              >
                <Square className="size-4 fill-current" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              title="Delete task"
              className="text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Popover */}
      {popoverOpen && (
        <div
          ref={popoverRef}
          className={cn(
            "absolute z-50 left-0 right-0 top-full mt-2",
            "bg-popover border border-border rounded-xl shadow-xl",
            "animate-in fade-in slide-in-from-top-2 duration-150",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-border/50">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-sm text-foreground">
                  {task.name}
                </h4>
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {task.tags.map((tag, i) => (
                      <span
                        key={tag}
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-md font-medium",
                          tagColors[i % tagColors.length],
                        )}
                      >
                        <Tag className="size-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-muted-foreground/60 mb-0.5">
                  Total Today
                </div>
                <div className="text-base font-mono font-bold tabular-nums text-foreground">
                  {formatDuration(todayLiveTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarClock className="size-3.5 text-muted-foreground/60" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Session Logs
              </span>
            </div>
            <SessionLogs
              logs={task.logs}
              onUpdate={(logs) => {
                const updated = { ...task, logs };
                saveTask(updated);
                onUpdate(updated);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
