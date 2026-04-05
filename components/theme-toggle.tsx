"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isDarkMode = stored !== "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2">
      <Moon className="size-3.5 text-muted-foreground" />
      <Switch
        checked={isDark}
        onCheckedChange={handleThemeChange}
        size="sm"
        aria-label="Toggle dark mode"
      />
      <Sun className="size-3.5 text-muted-foreground" />
    </div>
  );
}
