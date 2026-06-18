"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  type Task,
  type TimeLog,
} from "@/lib/db";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  runningCount: number;
  createTask: (name: string, tags: string[]) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  renameTask: (id: string, newName: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  startTask: (taskId: string) => Promise<void>;
  stopTask: (taskId: string) => Promise<void>;
  updateTaskLogs: (taskId: string, logs: TimeLog[]) => Promise<void>;
  exportTasks: () => void;
  importTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  // Read tasks Reactively using useLiveQuery.
  // It automatically triggers updates when any db.tasks updates occur.
  const tasks = useLiveQuery(async () => {
    const list = await db.tasks.toArray();
    return list.sort((a, b) => {
      const aRunning = a.logs.some((l) => l.endTimestamp === null) ? 1 : 0;
      const bRunning = b.logs.some((l) => l.endTimestamp === null) ? 1 : 0;
      if (bRunning !== aRunning) return bRunning - aRunning;

      const aMaxEnd = a.logs.reduce((max, log) => {
        return log.endTimestamp !== null ? Math.max(max, log.endTimestamp) : max;
      }, 0);
      const bMaxEnd = b.logs.reduce((max, log) => {
        return log.endTimestamp !== null ? Math.max(max, log.endTimestamp) : max;
      }, 0);

      if (bMaxEnd !== aMaxEnd) {
        return bMaxEnd - aMaxEnd;
      }
      return b.id.localeCompare(a.id);
    });
  });

  const loading = tasks === undefined;
  const tasksList = useMemo(() => tasks ?? [], [tasks]);

  const runningCount = tasksList.filter((t) =>
    t.logs.some((l) => l.endTimestamp === null),
  ).length;

  const createTask = useCallback(async (name: string, tags: string[]) => {
    const task: Task = { id: generateId(), name, tags, logs: [] };
    await db.tasks.put(task);
  }, []);

  const updateTask = useCallback(async (updated: Task) => {
    await db.tasks.put(updated);
  }, []);

  const renameTask = useCallback(async (id: string, newName: string) => {
    await db.tasks.update(id, { name: newName });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await db.tasks.delete(id);
  }, []);

  const startTask = useCallback(async (taskId: string) => {
    const now = Date.now();
    await db.transaction("readwrite", db.tasks, async () => {
      // 1. Find and stop any currently active task
      const allTasks = await db.tasks.toArray();
      const runningTask = allTasks.find((t) =>
        t.logs.some((l) => l.endTimestamp === null),
      );
      if (runningTask) {
        const updatedLogs: TimeLog[] = runningTask.logs.map((log) => {
          if (log.endTimestamp !== null) return log;
          const minutes = (now - log.startTimestamp) / 1000 / 60;
          return { ...log, endTimestamp: now, minutesSpent: minutes };
        });
        await db.tasks.update(runningTask.id, { logs: updatedLogs });
        if (runningTask.id === taskId) return;
      }

      // 2. Start target task
      const taskToStart = await db.tasks.get(taskId);
      if (!taskToStart) return;
      const newLog: TimeLog = {
        startTimestamp: now,
        endTimestamp: null,
        minutesSpent: null,
      };
      await db.tasks.update(taskId, {
        logs: [...taskToStart.logs, newLog],
      });
    });
  }, []);

  const stopTask = useCallback(async (taskId: string) => {
    const now = Date.now();
    await db.transaction("readwrite", db.tasks, async () => {
      const task = await db.tasks.get(taskId);
      if (!task) return;
      const activeLog = task.logs.find((l) => l.endTimestamp === null);
      if (!activeLog) return;
      const updatedLogs: TimeLog[] = task.logs.map((log) => {
        if (log.endTimestamp !== null) return log;
        const minutes = (now - log.startTimestamp) / 1000 / 60;
        return { ...log, endTimestamp: now, minutesSpent: minutes };
      });
      await db.tasks.update(taskId, { logs: updatedLogs });
    });
  }, []);

  const updateTaskLogs = useCallback(async (taskId: string, logs: TimeLog[]) => {
    await db.tasks.update(taskId, { logs });
  }, []);

  const exportTasks = useCallback(() => {
    const data = JSON.stringify(tasksList, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `1timer-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasksList]);

  const importTasks = useCallback(async () => {
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
        await db.transaction("readwrite", db.tasks, async () => {
          await db.tasks.clear();
          await db.tasks.bulkPut(imported);
        });
      } catch {
        alert("Failed to import: invalid file format");
      }
    };
    input.click();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks: tasksList,
        loading,
        runningCount,
        createTask,
        updateTask,
        renameTask,
        deleteTask,
        startTask,
        stopTask,
        updateTaskLogs,
        exportTasks,
        importTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}
