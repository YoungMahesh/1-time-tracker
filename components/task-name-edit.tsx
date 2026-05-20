"use client";

import { useState, useRef } from "react";
import { Pencil, Check, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskNameEditProps {
  taskName: string;
  onRename: (newName: string) => void;
  onDeleteRequest: () => void;
  onCancel: () => void;
}

export function TaskNameEdit({
  taskName,
  onRename,
  onDeleteRequest,
  onCancel,
}: TaskNameEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditedName(taskName);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    setDialogOpen(true);
  };

  const handleConfirmSave = () => {
    onRename(editedName);
    setIsEditing(false);
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    onCancel();
  };

  const handleDelete = () => {
    setIsEditing(false);
    onDeleteRequest();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-base text-foreground outline-none focus:border-primary"
          />
          <button
            onClick={handleSave}
            className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
            title="Save"
          >
            <Check className="size-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-destructive hover:bg-destructive/10 rounded"
            title="Delete task"
          >
            <Trash2 className="size-5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-muted-foreground hover:bg-muted/10 rounded"
            title="Cancel"
          >
            <X className="size-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">
            {taskName}
          </h3>
          <button
            onClick={handleStartEdit}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Rename task"
          >
            <Pencil className="size-5" />
          </button>
        </div>
      )}

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to rename this task?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2 space-y-1 text-sm">
            <div>
              <span className="font-medium text-foreground">From:</span>{" "}
              {taskName}
            </div>
            <div>
              <span className="font-medium text-foreground">To:</span>{" "}
              {editedName}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmSave();
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
