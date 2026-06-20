import { useRef, useState } from "react";
import { TimerReset, Search, X } from "lucide-react";
import { SettingsMenu } from "@/components/settings-menu";
import { NewTaskButton } from "@/components/new-task-button";
import { useTaskContext } from "@/lib/context/task-context";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function PageHeader({
  searchQuery = "",
  onSearchChange,
}: PageHeaderProps) {
  const { createTask } = useTaskContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    setSearchOpen(false);
    onSearchChange?.("");
  };

  return (
    <header className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div
          className={cn(
            "flex items-center gap-2.5",
            searchOpen && "max-sm:hidden",
          )}
        >
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TimerReset className="size-4.5 text-primary" strokeWidth={2} />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            1TimeTracker
          </span>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(searchOpen && "max-sm:hidden")}>
            <NewTaskButton onSubmit={createTask} />
          </div>
          {searchOpen ? (
            <div className="flex items-center gap-1.5 bg-accent rounded-lg px-2.5 py-1.5 flex-1 min-w-0">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
                onBlur={() => {
                  if (!searchQuery) closeSearch();
                }}
                placeholder="Search tasks..."
                className="bg-transparent border-none outline-none text-sm text-foreground flex-1 min-w-0 placeholder:text-muted-foreground/60"
              />
              <button
                onClick={closeSearch}
                className="size-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent-foreground/10 transition-colors shrink-0"
                tabIndex={-1}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openSearch}
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Search tasks"
            >
              <Search className="size-5" />
            </button>
          )}
          <div className={cn(searchOpen && "max-sm:hidden")}>
            <SettingsMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
