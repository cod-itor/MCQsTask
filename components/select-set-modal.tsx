"use client";

import { useState } from "react";
import { useSubjects } from "@/lib/subject-context";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, LayoutList } from "lucide-react";

interface SelectSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: "mcq" | "reading";
  onSelect: () => void; // Called when a set is selected or created
  darkMode: boolean;
}

export function SelectSetModal({
  open,
  onOpenChange,
  category,
  onSelect,
  darkMode,
}: SelectSetModalProps) {
  const { 
    activeSubjectId, 
    mcqSets, 
    readingSets, 
    setActiveMcqSet, 
    setActiveReadingSet,
    createMcqSet,
    createReadingSet
  } = useSubjects();
  
  const [showNewInput, setShowNewInput] = useState(false);
  const [newSetName, setNewSetName] = useState("");

  if (!activeSubjectId) return null;

  const sets = category === "mcq" 
    ? (mcqSets[activeSubjectId] || []) 
    : (readingSets[activeSubjectId] || []);

  const handleSelect = (setId: string) => {
    if (category === "mcq") {
      setActiveMcqSet(setId);
    } else {
      setActiveReadingSet(setId);
    }
    onOpenChange(false);
    onSelect();
  };

  const handleCreateNew = () => {
    const defaultName = newSetName.trim() || `Set ${sets.length + 1}`;
    let newId = "";
    if (category === "mcq") {
      newId = createMcqSet(activeSubjectId, defaultName);
      setActiveMcqSet(newId);
    } else {
      newId = createReadingSet(activeSubjectId, defaultName);
      setActiveReadingSet(newId);
    }
    setNewSetName("");
    setShowNewInput(false);
    onOpenChange(false);
    onSelect();
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      setShowNewInput(false);
      setNewSetName("");
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleModalClose}>
      <AlertDialogContent className={`max-w-md ${darkMode ? "bg-slate-800 border-slate-700" : ""}`}>
        <AlertDialogTitle className={darkMode ? "text-white" : "text-gray-900"}>
          Select {category === "mcq" ? "MCQ" : "Reading"} File
        </AlertDialogTitle>
        <AlertDialogDescription>
          Choose a file to open or create a new one.
        </AlertDialogDescription>

        <div className="space-y-3 my-4 max-h-64 overflow-y-auto pr-2">
          {sets.length === 0 ? (
            <div className={`p-4 text-center rounded-lg border border-dashed ${darkMode ? "border-slate-600 text-slate-400" : "border-gray-300 text-gray-500"}`}>
              No files found in this subject. Create a new one below.
            </div>
          ) : (
            sets.map(set => (
              <Button
                key={set.id}
                onClick={() => handleSelect(set.id)}
                variant="outline"
                className={`w-full justify-start h-auto py-3 ${
                  darkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-white" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {category === "mcq" ? <LayoutList className="w-5 h-5 opacity-70" /> : <FileText className="w-5 h-5 opacity-70" />}
                  <div className="text-left">
                    <div className="font-semibold">{set.name}</div>
                    <div className="text-xs opacity-70">
                      {category === "mcq" 
                        ? `${(set as any).mcqs?.length || 0} Questions` 
                        : `${(set as any).passages?.length || 0} Passages`
                      }
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>

        <div className="mt-2 border-t pt-4 border-slate-200 dark:border-slate-700">
          {!showNewInput ? (
            <Button
              onClick={() => setShowNewInput(true)}
              variant="outline"
              className={`w-full border-dashed ${
                darkMode ? "border-slate-600 hover:bg-slate-700 text-blue-400" : "text-blue-600"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New File
            </Button>
          ) : (
            <div className={`p-3 rounded-lg border ${darkMode ? "bg-slate-900/50 border-slate-700" : "bg-gray-50 border-gray-200"}`}>
              <p className="text-sm font-medium mb-2">File Name</p>
              <Input
                placeholder={`e.g. Set ${sets.length + 1}`}
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
                  onClick={handleCreateNew}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <AlertDialogCancel className={darkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white" : ""}>
            Cancel
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
