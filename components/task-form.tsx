"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  onSubmit: (name: string, tags: string[]) => void;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [focused, setFocused] = useState<"name" | "tag" | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSubmit(trimmedName, tags);
    setName("");
    setTags([]);
    setTagInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="size-7 rounded-md bg-primary/20 flex items-center justify-center">
          <Plus
            className="size-4 text-primary-foreground/80"
            strokeWidth={2.5}
          />
        </div>
        <span className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">
          New Task
        </span>
      </div>

      {/* Task name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="task-name"
          className="text-xs font-medium text-muted-foreground uppercase tracking-widest"
        >
          Task Name
        </label>
        <input
          id="task-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          placeholder="What are you working on?"
          autoComplete="off"
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all",
            focused === "name"
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-muted-foreground/30",
          )}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <Tag className="size-3" />
          Tags
        </label>
        <div
          onClick={() => tagInputRef.current?.focus()}
          className={cn(
            "min-h-10 w-full rounded-lg border bg-background px-2.5 py-1.5 flex flex-wrap gap-1.5 items-center cursor-text transition-all",
            focused === "tag"
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-muted-foreground/30",
          )}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-primary/15 text-primary-foreground/70 px-2 py-0.5 text-xs font-medium leading-none"
            >
              #{tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <X className="size-2.5" />
              </button>
            </span>
          ))}
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => {
              addTag();
              setFocused(null);
            }}
            onFocus={() => setFocused("tag")}
            placeholder={
              tags.length === 0 ? "Add tags (press Enter or comma)" : ""
            }
            className="flex-1 min-w-24 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 py-0.5"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!name.trim()}
        className="w-full mt-1 h-10 font-semibold tracking-wide"
      >
        <Plus className="size-4" />
        Create Task
      </Button>
    </form>
  );
}
