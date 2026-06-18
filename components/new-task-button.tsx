"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";

interface NewTaskButtonProps {
  onSubmit: (name: string, tags: string[]) => void;
}

export function NewTaskButton({ onSubmit }: NewTaskButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (name: string, tags: string[]) => {
    onSubmit(name, tags);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="size-7 bg-primary cursor-pointer hover:bg-primary/90 active:scale-95 transition-all">
            <Plus className="size-4 text-primary-foreground" strokeWidth={3} />
          </Button>
        }
      />
      <DialogContent>
        <TaskForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
