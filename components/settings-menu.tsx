"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Download, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTaskContext } from "@/lib/context/task-context";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { exportTasks, importTasks } = useTaskContext();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Settings"
      >
        <Settings className="size-6" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 z-50 w-56 bg-popover border border-border rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
          <div className="border-t border-border/50" />
          <div className="p-2">
            <button
              onClick={() => {
                exportTasks();
                close();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Download className="size-4" />
              Export data
            </button>
            <button
              onClick={() => {
                importTasks();
                close();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Upload className="size-4" />
              Import data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
