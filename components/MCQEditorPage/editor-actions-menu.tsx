"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Download, Trash2, RotateCcw, MoreVertical } from "lucide-react";
import { useState } from "react";

interface EditorActionsMenuProps {
  onExport: () => void;
  onRollback: () => void;
  onClearAll: () => void;
  canRollback: boolean;
  hasMcqs: boolean;
  darkMode: boolean;
}

export function EditorActionsMenu({
  onExport,
  onRollback,
  onClearAll,
  canRollback,
  hasMcqs,
  darkMode,
}: EditorActionsMenuProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMcqs}
            className={`${darkMode ? "bg-slate-700 border-slate-600" : ""}`}
            title="More actions"
          >
            <MoreVertical className="w-4 h-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={darkMode ? "bg-slate-800 border-slate-700" : ""}
        >
          <DropdownMenuItem
            onClick={onExport}
            disabled={!hasMcqs}
            className={darkMode ? "focus:bg-slate-700" : ""}
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowRollbackDialog(true)}
            disabled={!canRollback}
            className={darkMode ? "focus:bg-slate-700" : ""}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Rollback to Last Saved
          </DropdownMenuItem>
          <DropdownMenuSeparator className={darkMode ? "bg-slate-700" : ""} />
          <DropdownMenuItem
            onClick={() => setShowClearDialog(true)}
            disabled={!hasMcqs}
            className={`text-red-500 ${
              darkMode
                ? "focus:bg-slate-700 focus:text-red-400"
                : "focus:text-red-600"
            }`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Erase All Questions
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rollback Confirmation */}
      <AlertDialog
        open={showRollbackDialog}
        onOpenChange={setShowRollbackDialog}
      >
        <AlertDialogContent
          className={darkMode ? "bg-slate-800 border-slate-700" : ""}
        >
          <AlertDialogTitle>Rollback Changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose all unsaved changes and revert to the last saved
            version. This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3">
            <AlertDialogCancel
              className={darkMode ? "bg-slate-700 border-slate-600" : ""}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRollback();
                setShowRollbackDialog(false);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Rollback
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent
          className={darkMode ? "bg-slate-800 border-slate-700" : ""}
        >
          <AlertDialogTitle>Delete All Questions?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all questions in this editor. This
            action cannot be undone. Make sure to export your questions first if
            you need to keep them.
          </AlertDialogDescription>
          <div className="flex gap-3">
            <AlertDialogCancel
              className={darkMode ? "bg-slate-700 border-slate-600" : ""}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClearAll();
                setShowClearDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
