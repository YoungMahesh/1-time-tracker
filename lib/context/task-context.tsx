"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getAllTasks,
  saveTask,
  importTasks as dbImportTasks,
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
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  startTask: (taskId: string) => Promise<void>;
  stopTask: (taskId: string) => Promise<void>;
  updateTaskLogs: (taskId: string, logs: TimeLog[]) => void;
  exportTasks: () => void;
  importTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const runningCount = tasks.filter((t) =>
    t.logs.some((l) => l.endTimestamp === null),
  ).length;

  useEffect(() => {
    getAllTasks()
      .then((t) =>
        setTasks(
          t.sort((a, b) => {
            const aRunning = a.logs.some((l) => l.endTimestamp === null)
              ? 1
              : 0;
            const bRunning = b.logs.some((l) => l.endTimestamp === null)
              ? 1
              : 0;
            if (bRunning !== aRunning) return bRunning - aRunning;
            return b.logs.length - a.logs.length;
          }),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const createTask = useCallback(async (name: string, tags: string[]) => {
    const task: Task = { id: generateId(), name, tags, logs: [] };
    await saveTask(task);
    setTasks((prev) => [task, ...prev]);
  }, []);

  const updateTask = useCallback((updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const startTask = useCallback(async (taskId: string) => {
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
      const updated: Task = {
        ...taskToStart,
        logs: [...taskToStart.logs, newLog],
      };
      saveTask(updated);
      return [
        updated,
        ...prev
          .filter((t) => t.id !== taskId)
          .map((t) => (t.id === runningTask?.id ? updatedRunning! : t)),
      ];
    });
  }, []);

  const stopTask = useCallback(async (taskId: string) => {
    const now = Date.now();
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      const activeLog = task.logs.find((l) => l.endTimestamp === null);
      if (!activeLog) return prev;
      const updatedLogs: TimeLog[] = task.logs.map((log) => {
        if (log.endTimestamp !== null) return log;
        const minutes = (now - log.startTimestamp) / 1000 / 60;
        return { ...log, endTimestamp: now, minutesSpent: minutes };
      });
      const updated: Task = { ...task, logs: updatedLogs };
      saveTask(updated);
      return prev.map((t) => (t.id === taskId ? updated : t));
    });
  }, []);

  const updateTaskLogs = useCallback((taskId: string, logs: TimeLog[]) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      const updated = { ...task, logs };
      saveTask(updated);
      return prev.map((t) => (t.id === taskId ? updated : t));
    });
  }, []);

  const exportTasks = useCallback(() => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `1timer-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

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
        await dbImportTasks(imported);
        setTasks(imported);
      } catch {
        alert("Failed to import: invalid file format");
      }
    };
    input.click();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        runningCount,
        createTask,
        updateTask,
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
