import Dexie, { type Table } from "dexie";

export interface TimeLog {
  startTimestamp: number;
  endTimestamp: number | null;
  minutesSpent: number | null;
}

export interface Task {
  id: string;
  name: string;
  tags: string[];
  logs: TimeLog[];
}

export class OneTimerDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super("1timer-db");
    this.version(1).stores({
      tasks: "id, name",
    });
  }
}

export const db = new OneTimerDatabase();

export function getTotalMinutes(task: Task): number {
  return task.logs.reduce((acc, log) => {
    if (log.minutesSpent !== null) return acc + log.minutesSpent;
    return acc;
  }, 0);
}

export function formatDuration(minutes: number): string {
  // Work in whole seconds to avoid floating-point drift when summing sessions
  const totalSeconds = Math.round(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
