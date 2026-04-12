"use client";

import { useState } from "react";
import { ChevronRight, Plus, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type TimeLog, formatDuration } from "@/lib/db";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/lib/context/task-context";
import SessionLogEntry from "./session-log-entry";

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
  taskId: string;
  logs: TimeLog[];
  onDeleteDialogOpenChange?: (open: boolean) => void;
}

export function SessionLogs({
  taskId,
  logs,
  onDeleteDialogOpenChange,
}: SessionLogsProps) {
  const { updateTaskLogs } = useTaskContext();
  const grouped = groupLogsByDate([...logs].reverse());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [deleteLogTimestamp, setDeleteLogTimestamp] = useState<number | null>(
    null,
  );
  const [editingLogTimestamp, setEditingLogTimestamp] = useState<number | null>(
    null,
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
    updateTaskLogs(taskId, [...logs, newLog]);
    setNewStart("");
    setNewEnd("");
    setShowAddForm(false);
  };

  const handleUpdateLog = (originalLog: TimeLog, updated: TimeLog) => {
    updateTaskLogs(
      taskId,
      logs.map((l) => (l === originalLog ? updated : l)),
    );
  };

  const handleDeleteLog = (startTimestamp: number) => {
    updateTaskLogs(
      taskId,
      logs.filter((l) => l.startTimestamp !== startTimestamp),
    );
  };

  const confirmDeleteLog = () => {
    if (deleteLogTimestamp !== null) {
      handleDeleteLog(deleteLogTimestamp);
      setDeleteLogTimestamp(null);
    }
  };

  if (logs.length === 0 && !showAddForm) {
    return (
      <div className="py-4 text-center text-base text-muted-foreground/40">
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
            <span className="text-base font-semibold text-muted-foreground">
              New Session
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleAddSession}
                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                title="Save"
              >
                <Check className="size-5" />
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
                <X className="size-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-base text-muted-foreground uppercase tracking-wider">
                Start
              </label>
              <input
                type="datetime-local"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-base text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base text-muted-foreground uppercase tracking-wider">
                End
              </label>
              <input
                type="datetime-local"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full rounded border border-border bg-background px-2 py-1 text-base text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 w-full py-2 text-base text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <Plus className="size-5" />
          <span>Add session</span>
        </button>
      )}
      {grouped.map((group) => (
        <div key={group.date}>
          <button
            onClick={() => toggleDate(group.date)}
            className="flex items-center gap-1.5 w-full py-2 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-150",
                expandedDates.has(group.date) && "rotate-90",
              )}
            />
            <span className="uppercase tracking-widest">{group.label}</span>
            <span className="text-muted-foreground/40 ml-1">
              ({group.logs.length})
            </span>
            <span className="ml-auto font-mono text-base text-muted-foreground/50">
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
                  <SessionLogEntry
                    key={log.startTimestamp}
                    log={log}
                    index={globalIndex}
                    onUpdate={(updated) => handleUpdateLog(log, updated)}
                    onDelete={() => {
                      setDeleteLogTimestamp(log.startTimestamp);
                      onDeleteDialogOpenChange?.(true);
                    }}
                    onCancel={() => setEditingLogTimestamp(null)}
                    onStartEditing={() =>
                      setEditingLogTimestamp(log.startTimestamp)
                    }
                    isEditing={editingLogTimestamp === log.startTimestamp}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
      <AlertDialog
        open={deleteLogTimestamp !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteLogTimestamp(null);
            onDeleteDialogOpenChange?.(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                confirmDeleteLog();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
