"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { MCQ } from "@/lib/types";

interface ImportBehaviorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMcqs: MCQ[];
  existingMcqCount: number;
  onConfirm: (behavior: "override" | "add") => void;
  darkMode: boolean;
}

export function ImportBehaviorModal({
  open,
  onOpenChange,
  newMcqs,
  existingMcqCount,
  onConfirm,
  darkMode,
}: ImportBehaviorModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={darkMode ? "bg-slate-800 border-slate-700" : ""}
      >
        <AlertDialogTitle>Import Behavior</AlertDialogTitle>
        <AlertDialogDescription>
          You are importing {newMcqs.length} MCQ(s). You currently have{" "}
          {existingMcqCount} MCQ(s).
        </AlertDialogDescription>
        <div className="space-y-3 my-4">
          <Button
            onClick={() => {
              onConfirm("override");
              onOpenChange(false);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Override Existing ({existingMcqCount} will be replaced)
          </Button>
          <Button
            onClick={() => {
              onConfirm("add");
              onOpenChange(false);
            }}
            variant="outline"
            className={`w-full ${
              darkMode ? "bg-slate-700 border-slate-600" : ""
            }`}
          >
            Add to Existing ({existingMcqCount + newMcqs.length} total)
          </Button>
        </div>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel
            className={darkMode ? "bg-slate-700 border-slate-600" : ""}
          >
            Cancel
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
