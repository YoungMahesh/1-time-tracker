"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Pencil, Check, X } from "lucide-react";
import { type TimeLog, formatDuration, formatTimestamp } from "@/lib/db";
import { cn } from "@/lib/utils";

function toLocalDateTime(ts: number) {
  return new Date(ts)
    .toLocaleString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(" ", "T");
}

function parseLocalDateTime(value: string) {
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

function EditSessionForm({
  log,
  index,
  onUpdate,
  onDelete,
  onCancel,
}: {
  log: TimeLog;
  index: number;
  onUpdate: (updated: TimeLog) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [editStart, setEditStart] = useState(
    toLocalDateTime(log.startTimestamp),
  );
  const [editEnd, setEditEnd] = useState(
    log.endTimestamp !== null ? toLocalDateTime(log.endTimestamp) : "",
  );

  const saveEditing = () => {
    const newStart = parseLocalDateTime(editStart);
    const newEnd = editEnd ? parseLocalDateTime(editEnd) : null;
    const minutesSpent =
      newEnd !== null ? (newEnd - newStart) / 1000 / 60 : null;
    onUpdate({
      ...log,
      startTimestamp: newStart,
      endTimestamp: newEnd,
      minutesSpent,
    });
  };

  return (
    <div className="py-2.5 border-b border-border/40 last:border-0 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-muted-foreground">
          Edit Session #{index + 1}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={saveEditing}
            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
            title="Save"
          >
            <Check className="size-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-destructive hover:bg-destructive/10 rounded"
            title="Delete"
          >
            <X className="size-5" />
          </button>
          <button
            onClick={onCancel}
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
            value={editStart}
            onChange={(e) => setEditStart(e.target.value)}
            className="w-full rounded border border-border bg-background px-2 py-1 text-base text-foreground outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base text-muted-foreground uppercase tracking-wider">
            End
          </label>
          <input
            type="datetime-local"
            value={editEnd}
            onChange={(e) => setEditEnd(e.target.value)}
            className="w-full rounded border border-border bg-background px-2 py-1 text-base text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}

interface SessionLogEntryProps {
  log: TimeLog;
  index: number;
  onUpdate: (updated: TimeLog) => void;
  onDelete: () => void;
  onCancel: () => void;
  onStartEditing: () => void;
  isEditing: boolean;
}

export default function SessionLogEntry({
  log,
  index,
  onUpdate,
  onDelete,
  onCancel,
  onStartEditing,
  isEditing,
}: SessionLogEntryProps) {
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
    <>
      {isEditing ? (
        <EditSessionForm
          log={log}
          index={index}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onCancel={onCancel}
        />
      ) : (
        <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0 group">
          <div className="flex flex-col items-center mt-0.5">
            <div
              className={cn(
                "size-2.5 rounded-full mt-1",
                log.endTimestamp === null
                  ? "bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.4)] animate-pulse"
                  : "bg-muted-foreground/30",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-muted-foreground">
                  Session #{index + 1}
                </span>
                <button
                  onClick={onStartEditing}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit session"
                >
                  <Pencil className="size-5" />
                </button>
              </div>
              <span
                className={cn(
                  "text-base font-mono font-bold tabular-nums",
                  log.endTimestamp === null
                    ? "text-emerald-500"
                    : "text-foreground/70",
                )}
              >
                {duration}
              </span>
            </div>
            <div className="text-base text-muted-foreground/60 mt-0.5 flex items-center gap-1">
              <span>{formatTimestamp(log.startTimestamp)}</span>
              {log.endTimestamp !== null && (
                <>
                  <ChevronRight className="size-4 shrink-0" />
                  <span>{formatTimestamp(log.endTimestamp)}</span>
                </>
              )}
              {log.endTimestamp === null && (
                <span className="ml-1 text-emerald-500 font-medium">
                  • running
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
