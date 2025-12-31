"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClearAllModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mcqCount: number;
  onConfirm: () => void;
  darkMode: boolean;
}

export function ClearAllModal({
  open,
  onOpenChange,
  mcqCount,
  onConfirm,
  darkMode,
}: ClearAllModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={darkMode ? "bg-slate-800 border-slate-700" : ""}
      >
        <AlertDialogTitle className="text-red-600">
          Delete All Questions?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete all {mcqCount} question(s) in this
          subject. This action cannot be undone.
        </AlertDialogDescription>
        <div className="flex gap-3 justify-end mt-6">
          <AlertDialogCancel
            className={darkMode ? "bg-slate-700 border-slate-600" : ""}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete All {mcqCount} Questions
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
