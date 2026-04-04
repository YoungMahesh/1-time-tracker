"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) !== "light";
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="flex items-center gap-2">
      <Moon className="size-3.5 text-muted-foreground" />
      <Switch
        checked={isDark}
        onCheckedChange={setIsDark}
        size="sm"
        aria-label="Toggle dark mode"
      />
      <Sun className="size-3.5 text-muted-foreground" />
    </div>
  );
}
