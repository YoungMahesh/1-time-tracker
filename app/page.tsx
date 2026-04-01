"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Layers, TimerReset } from "lucide-react";
import { TaskForm } from "@/components/task-form";
import { TaskCard } from "@/components/task-card";
import {
  getAllTasks,
  saveTask,
  getTotalMinutes,
  formatDuration,
  type Task,
} from "@/lib/db";
import { cn } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Grand total live ticker ────────────────────────────────────────────────────

function useLiveTotalMinutes(tasks: Task[]): number {
  const [, setTick] = useState(0);
  const hasRunning = tasks.some((t) =>
    t.logs.some((l) => l.endTimestamp === null),
  );

  useEffect(() => {
    if (!hasRunning) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [hasRunning]);

  return tasks.reduce((acc, task) => {
    const completed = task.logs
      .filter((l) => l.endTimestamp !== null)
      .reduce((s, l) => s + (l.minutesSpent ?? 0), 0);
    const active = task.logs.find((l) => l.endTimestamp === null);
    // This impure function call is intentional - it's triggered only when state changes
    // via the interval in useEffect, providing live time updates for active tasks
    const liveSeconds = active
      ? (Date.now() - active.startTimestamp) / 1000 // eslint-disable-line react-hooks/purity
      : 0;
    return acc + completed + liveSeconds / 60;
  }, 0);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTasks()
      .then((t) => setTasks(t.sort((a, b) => b.logs.length - a.logs.length)))
      .finally(() => setLoading(false));
  }, []);

  const liveTotal = useLiveTotalMinutes(tasks);

  const handleCreate = useCallback(async (name: string, tags: string[]) => {
    const task: Task = { id: generateId(), name, tags, logs: [] };
    await saveTask(task);
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleUpdate = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const totalTrackedMinutes = tasks.reduce(
    (acc, t) => acc + getTotalMinutes(t),
    0,
  );
  const runningCount = tasks.filter((t) =>
    t.logs.some((l) => l.endTimestamp === null),
  ).length;

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TimerReset className="size-4.5 text-primary" strokeWidth={2} />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              1TimeTracker
            </span>
          </div>

          <div className="flex items-center gap-3">
            {runningCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1 font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {runningCount} running
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span className="font-mono font-semibold tabular-nums text-foreground/80">
                {formatDuration(liveTotal)}
              </span>
              <span className="hidden sm:inline">total today</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_1fr] gap-8 items-start">
          {/* ── Sidebar: Form + Stats ── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            <TaskForm onSubmit={handleCreate} />

            {/* Stats */}
            {tasks.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Layers className="size-3.5 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
                      Tasks
                    </span>
                  </div>
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {tasks.length}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="size-3.5 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
                      Logged
                    </span>
                  </div>
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {formatDuration(totalTrackedMinutes)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Task list ── */}
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl border border-border bg-card h-24 animate-pulse",
                      i === 1 && "opacity-100",
                      i === 2 && "opacity-60",
                      i === 3 && "opacity-30",
                    )}
                  />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <Clock
                    className="size-8 text-muted-foreground/30"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="text-base font-semibold text-foreground/60 mb-1.5">
                  No tasks yet
                </h2>
                <p className="text-sm text-muted-foreground/40 max-w-xs">
                  Create your first task using the form to start tracking time.
                </p>
              </div>
            ) : (
              <>
                {/* Running tasks first */}
                {tasks
                  .filter((t) => t.logs.some((l) => l.endTimestamp === null))
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                {/* Idle tasks */}
                {tasks
                  .filter((t) => !t.logs.some((l) => l.endTimestamp === null))
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
