"use client";

import { useState, useEffect } from "react";
import { Clock, Layers, TimerReset, Download, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatePresence, motion } from "framer-motion";
import { TaskForm } from "@/components/task-form";
import { TaskCard } from "@/components/task-card";
import { TaskProvider, useTaskContext } from "@/lib/context/task-context";
import { formatDuration } from "@/lib/db";
import { cn } from "@/lib/utils";

function getTodayMinutes(
  tasks: {
    logs: {
      endTimestamp: number | null;
      minutesSpent: number | null;
      startTimestamp: number;
    }[];
  }[],
): number {
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
    const liveSeconds = active
      ? (Date.now() - active.startTimestamp) / 1000
      : 0;
    return acc + completed + liveSeconds / 60;
  }, 0);
}

function getTodayTaskCount(
  tasks: { logs: { startTimestamp: number; endTimestamp: number | null }[] }[],
): number {
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

function HomeContent() {
  const { tasks, loading, runningCount, createTask, exportTasks, importTasks } =
    useTaskContext();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (runningCount === 0) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [runningCount]);

  return (
    <main className="min-h-screen bg-background">
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
            <ThemeToggle />
            <div className="flex items-center gap-1 border-l border-border pl-3">
              <button
                onClick={exportTasks}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Export data"
              >
                <Download className="size-4" />
              </button>
              <button
                onClick={importTasks}
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
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            <TaskForm onSubmit={createTask} />

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
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <TaskCard task={task} />
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

export default function Home() {
  return (
    <TaskProvider>
      <HomeContent />
    </TaskProvider>
  );
}
