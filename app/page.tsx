"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Layers, TimerReset, Download, Upload } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskForm } from "@/components/task-form";
import { TaskCard } from "@/components/task-card";
import {
  getAllTasks,
  saveTask,
  formatDuration,
  importTasks,
  type Task,
  type TimeLog,
} from "@/lib/db";
import { cn } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTodayMinutes(tasks: Task[]): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return tasks.reduce((acc, task) => {
    const completed = task.logs
      .filter((l) => {
        if (l.endTimestamp === null) return false;
        const logDate = new Date(l.startTimestamp);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === todayStart.getTime();
      })
      .reduce((s, l) => s + (l.minutesSpent ?? 0), 0);
    const active = task.logs.find((l) => {
      if (l.endTimestamp !== null) return false;
      const logDate = new Date(l.startTimestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === todayStart.getTime();
    });
    const liveSeconds = active ? (Date.now() - active.startTimestamp) / 1000 : 0;
    return acc + completed + liveSeconds / 60;
  }, 0);
}

function getTodayTaskCount(tasks: Task[]): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return tasks.filter((task) =>
    task.logs.some((l) => {
      const logDate = new Date(l.startTimestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === todayStart.getTime();
    }),
  ).length;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const hasRunning = tasks.some((t) =>
    t.logs.some((l) => l.endTimestamp === null),
  );

  useEffect(() => {
    if (!hasRunning) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [hasRunning]);

  useEffect(() => {
    getAllTasks()
      .then((t) =>
        setTasks(
          t.sort((a, b) => {
            const aRunning = a.logs.some((l) => l.endTimestamp === null) ? 1 : 0;
            const bRunning = b.logs.some((l) => l.endTimestamp === null) ? 1 : 0;
            if (bRunning !== aRunning) return bRunning - aRunning;
            return b.logs.length - a.logs.length;
          }),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = useCallback(async (name: string, tags: string[]) => {
    const task: Task = { id: generateId(), name, tags, logs: [] };
    await saveTask(task);
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleUpdate = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const handleStart = useCallback(
    async (taskId: string) => {
      const now = Date.now();
      let updatedRunning: Task | null = null;
      setTasks((prev) => {
        const runningTask = prev.find((t) =>
          t.logs.some((l) => l.endTimestamp === null),
        );
        if (runningTask) {
          const updatedLogs: TimeLog[] = runningTask.logs.map((log) => {
            if (log.endTimestamp !== null) return log;
            const minutes = (now - log.startTimestamp) / 1000 / 60;
            return { ...log, endTimestamp: now, minutesSpent: minutes };
          });
          updatedRunning = { ...runningTask, logs: updatedLogs };
          saveTask(updatedRunning);
          if (runningTask.id === taskId) return prev;
        }
        const taskToStart = prev.find((t) => t.id === taskId);
        if (!taskToStart) return prev;
        const newLog: TimeLog = {
          startTimestamp: now,
          endTimestamp: null,
          minutesSpent: null,
        };
        const updated: Task = { ...taskToStart, logs: [...taskToStart.logs, newLog] };
        saveTask(updated);
        return [
          updated,
          ...prev
            .filter((t) => t.id !== taskId)
            .map((t) => (t.id === runningTask?.id ? updatedRunning! : t)),
        ];
      });
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `1timer-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

  const handleImport = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text) as Task[];
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        await importTasks(imported);
        setTasks(imported);
      } catch {
        alert("Failed to import: invalid file format");
      }
    };
    input.click();
  }, []);

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
            <div className="flex items-center gap-1 border-l border-border pl-3">
              <button
                onClick={handleExport}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Export data"
              >
                <Download className="size-4" />
              </button>
              <button
                onClick={handleImport}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Import data"
              >
                <Upload className="size-4" />
              </button>
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
                      Tasks Today
                    </span>
                  </div>
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {getTodayTaskCount(tasks)}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="size-3.5 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
                      Total Today
                    </span>
                  </div>
                  <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
                    {formatDuration(getTodayMinutes(tasks))}
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
              <motion.div className="flex flex-col gap-3" layout>
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <TaskCard
                        task={task}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onStart={handleStart}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
