"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Plus, Pencil, Check, X } from "lucide-react";
import { type TimeLog, formatDuration, formatTimestamp } from "@/lib/db";
import { cn } from "@/lib/utils";

function LogEntry({
  log,
  index,
  onUpdate,
  onDelete,
}: {
  log: TimeLog;
  index: number;
  onUpdate: (updated: TimeLog) => void;
  onDelete: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

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

  const toLocalDateTime = (ts: number) =>
    new Date(ts)
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(" ", "T");

  const startDateTimeLocal = toLocalDateTime(log.startTimestamp);
  const endDateTimeLocal =
    log.endTimestamp !== null ? toLocalDateTime(log.endTimestamp) : "";

  const startEditing = () => {
    setEditStart(startDateTimeLocal);
    setEditEnd(endDateTimeLocal);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditStart("");
    setEditEnd("");
  };

  const parseLocalDateTime = (value: string) => {
    const [date, time] = value.split("T");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute).getTime();
  };

  const saveEditing = () => {
    const newStart = parseLocalDateTime(editStart);
    const newEnd = editEnd ? parseLocalDateTime(editEnd) : null;
    const minutesSpent =
      newEnd !== null ? (newEnd - newStart) / 1000 / 60 : null;
    onUpdate({ ...log, startTimestamp: newStart, endTimestamp: newEnd, minutesSpent });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="py-2.5 border-b border-border/40 last:border-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Edit Session #{index + 1}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={saveEditing}
              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
              title="Save"
            >
              <Check className="size-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-destructive hover:bg-destructive/10 rounded"
              title="Delete"
            >
              <X className="size-3.5" />
            </button>
            <button
              onClick={cancelEditing}
              className="p-1 text-muted-foreground hover:bg-muted/10 rounded"
              title="Cancel"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Start
            </label>
            <input
              type="datetime-local"
              value={editStart}
              onChange={(e) => setEditStart(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
              End
            </label>
            <input
              type="datetime-local"
              value={editEnd}
              onChange={(e) => setEditEnd(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0 group">
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
          <div className="flex items-center gap-1.5">
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
            <button
              onClick={startEditing}
              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
              title="Edit session"
            >
              <Pencil className="size-3" />
            </button>
          </div>
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
  totalMinutes: number;
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
      groups.set(dateKey, { label, date: dateKey, logs: [], totalMinutes: 0 });
    }
    const group = groups.get(dateKey)!;
    group.logs.push(log);
    if (log.minutesSpent !== null) {
      group.totalMinutes += log.minutesSpent;
    }
  }

  return Array.from(groups.values());
}

interface SessionLogsProps {
  logs: TimeLog[];
  onUpdate: (logs: TimeLog[]) => void;
}

export function SessionLogs({ logs, onUpdate }: SessionLogsProps) {
  const grouped = groupLogsByDate([...logs].reverse());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(
    () => new Set(grouped.map((g) => g.date)),
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

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

  const handleAddSession = () => {
    if (!newStart) return;
    const start = new Date(newStart).getTime();
    const end = newEnd ? new Date(newEnd).getTime() : null;
    const minutesSpent = end !== null ? (end - start) / 1000 / 60 : null;
    const newLog: TimeLog = {
      startTimestamp: start,
      endTimestamp: end,
      minutesSpent,
    };
    onUpdate([...logs, newLog]);
    setNewStart("");
    setNewEnd("");
    setShowAddForm(false);
  };

  const handleUpdateLog = (originalLog: TimeLog, updated: TimeLog) => {
    onUpdate(logs.map((l) => (l === originalLog ? updated : l)));
  };

  const handleDeleteLog = (startTimestamp: number) => {
    onUpdate(logs.filter((l) => l.startTimestamp !== startTimestamp));
  };

  if (logs.length === 0 && !showAddForm) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground/40">
        <button
          onClick={() => setShowAddForm(true)}
          className="hover:text-foreground transition-colors"
        >
          No sessions yet. Press play to start tracking or add one manually.
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto pr-1 -mr-1">
      {showAddForm ? (
        <div className="py-2.5 border-b border-border/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              New Session
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleAddSession}
                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                title="Save"
              >
                <Check className="size-3.5" />
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewStart("");
                  setNewEnd("");
                }}
                className="p-1 text-muted-foreground hover:bg-muted/10 rounded"
                title="Cancel"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Start
              </label>
              <input
                type="datetime-local"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                End
              </label>
              <input
                type="datetime-local"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 w-full py-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <Plus className="size-3.5" />
          <span>Add session</span>
        </button>
      )}
      {grouped.map((group) => (
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
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">
              {formatDuration(group.totalMinutes)}
            </span>
          </button>
          {expandedDates.has(group.date) && (
            <div className="pl-2">
              {group.logs.map((log) => {
                const globalIndex = logs.findIndex(
                  (l) => l.startTimestamp === log.startTimestamp,
                );
                return (
                  <LogEntry
                    key={log.startTimestamp}
                    log={log}
                    index={globalIndex}
                    onUpdate={(updated) => handleUpdateLog(log, updated)}
                    onDelete={() => handleDeleteLog(log.startTimestamp)}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
