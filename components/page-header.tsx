import { TimerReset } from "lucide-react";
import { SettingsMenu } from "@/components/settings-menu";
import { NewTaskButton } from "@/components/new-task-button";
import { useTaskContext } from "@/lib/context/task-context";

export default function PageHeader() {
  const { createTask } = useTaskContext();
  return (
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
          <NewTaskButton onSubmit={createTask} />
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
}
