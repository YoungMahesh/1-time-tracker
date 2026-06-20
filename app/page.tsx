"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskCard } from "@/components/task-card";
import { TaskProvider, useTaskContext } from "@/lib/context/task-context";
import { TimeByDay } from "@/components/time-by-day";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/page-header";

function HomeContent() {
  const { tasks, loading, runningCount } = useTaskContext();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (runningCount === 0) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [runningCount]);

  return (
    <main className="min-h-screen bg-background">
      <PageHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_1fr] gap-8 items-start">
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            {tasks.length > 0 && (
              <div className="flex flex-col gap-3">
                <TimeByDay tasks={tasks} isRunning={runningCount > 0} />
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
