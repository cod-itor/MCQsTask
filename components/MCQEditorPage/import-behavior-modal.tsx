"use client";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MCQ } from "@/lib/types";

interface ImportBehaviorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMcqs: any[]; // Using any[] since it's shared between MCQ and ReadingPassage
  existingMcqCount: number;
  onConfirm: (behavior: "override" | "add" | "new", newSetName?: string) => Promise<void> | void;
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
  const [newSetName, setNewSetName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setNewSetName("");
      setShowNewInput(false);
      setIsSubmitting(false);
    }
  }, [open]);

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
            onClick={async () => {
              setIsSubmitting(true);
              await onConfirm("override");
              setIsSubmitting(false);
              onOpenChange(false);
            }}
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Importing..." : `Override Existing (${existingMcqCount} will be replaced)`}
          </Button>
          <Button
            onClick={async () => {
              setIsSubmitting(true);
              await onConfirm("add");
              setIsSubmitting(false);
              onOpenChange(false);
            }}
            disabled={isSubmitting}
            variant="outline"
            className={`w-full ${
              darkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : ""
            }`}
          >
            {isSubmitting ? "Importing..." : `Add to Existing (${existingMcqCount + newMcqs.length} total)`}
          </Button>
          
          {!showNewInput ? (
            <Button
              onClick={() => setShowNewInput(true)}
              variant="outline"
              className={`w-full ${
                darkMode ? "bg-slate-700 border-slate-600 text-blue-400 hover:bg-slate-600" : "text-blue-600"
              }`}
            >
              Create as New File
            </Button>
          ) : (
            <div className={`p-4 rounded-lg border ${darkMode ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200"}`}>
              <p className="text-sm font-medium mb-2">File Name</p>
              <Input
                placeholder="e.g. New Set"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                className={`mb-3 ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white"}`}
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowNewInput(false)}
                  variant="ghost" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    setIsSubmitting(true);
                    await onConfirm("new", newSetName);
                    setIsSubmitting(false);
                    onOpenChange(false);
                  }}
                  disabled={isSubmitting || !newSetName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Creating..." : "Create & Import"}
                </Button>
              </div>
            </div>
          )}
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
