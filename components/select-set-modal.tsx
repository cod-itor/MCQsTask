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
import { Plus, FileText, LayoutList, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface SelectSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: "mcq" | "reading" | "Audio Flashcard";
  onSelect: (isEmpty?: boolean) => void; // Called when a set is selected or created
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
    listeningSets,
    setActiveMcqSet,
    setActiveReadingSet,
    setActiveListeningSet,
    createMcqSet,
    createReadingSet,
    createListeningSet,
    renameMcqSet,
    renameReadingSet,
    renameListeningSet,
    deleteMcqSet,
    deleteReadingSet,
    deleteListeningSet
  } = useSubjects();

  const [showNewInput, setShowNewInput] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!activeSubjectId) return null;

  const sets = category === "mcq"
    ? (mcqSets[activeSubjectId] || [])
    : category === "reading"
      ? (readingSets[activeSubjectId] || [])
      : (listeningSets[activeSubjectId] || []);

  const handleSelect = (setId: string) => {
    if (category === "mcq") {
      setActiveMcqSet(setId);
    } else if (category === "reading") {
      setActiveReadingSet(setId);
    } else {
      setActiveListeningSet(setId);
    }
    const isSetEmpty = category === "mcq"
      ? ((mcqSets[activeSubjectId] || []).find(s => s.id === setId)?.mcqs?.length === 0)
      : category === "reading"
        ? ((readingSets[activeSubjectId] || []).find(s => s.id === setId)?.passages?.length === 0)
        : ((listeningSets[activeSubjectId] || []).find(s => s.id === setId)?.questions?.length === 0);

    onOpenChange(false);
    onSelect(isSetEmpty);
  };

  const handleEditSave = async (setId: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (category === "mcq") {
        await renameMcqSet(activeSubjectId, setId, editName.trim());
      } else if (category === "reading") {
        await renameReadingSet(activeSubjectId, setId, editName.trim());
      } else {
        await renameListeningSet(activeSubjectId, setId, editName.trim());
      }
    } catch (error) {
      toast.error("Failed to rename file");
    } finally {
      setIsSubmitting(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (setId: string) => {
    setIsSubmitting(true);
    try {
      if (category === "mcq") {
        await deleteMcqSet(activeSubjectId, setId);
      } else if (category === "reading") {
        await deleteReadingSet(activeSubjectId, setId);
      } else {
        await deleteListeningSet(activeSubjectId, setId);
      }
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
    } finally {
      setIsSubmitting(false);
      setDeletingId(null);
    }
  };

  const handleCreateNew = async () => {
    setIsSubmitting(true);
    try {
      const defaultName = newSetName.trim() || `Set ${sets.length + 1}`;
      let newId = "";
      if (category === "mcq") {
        newId = await createMcqSet(activeSubjectId, defaultName);
        setActiveMcqSet(newId);
      } else if (category === "reading") {
        newId = await createReadingSet(activeSubjectId, defaultName);
        setActiveReadingSet(newId);
      } else {
        newId = await createListeningSet(activeSubjectId, defaultName);
        setActiveListeningSet(newId);
      }
      setNewSetName("");
      setShowNewInput(false);
      onOpenChange(false);
      onSelect(true); // new sets are always empty
    } finally {
      setIsSubmitting(false);
    }
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
          Select {category === "mcq" ? "MCQ" : category === "reading" ? "Reading" : "Audio Flashcard"} File
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
              <div
                key={set.id}
                className={`flex items-center justify-between w-full p-3 rounded-md border cursor-pointer transition-colors group ${
                  darkMode 
                    ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-white" 
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-900"
                }`}
                onClick={(e) => {
                  // Only select if not clicking action buttons
                  const target = e.target as HTMLElement;
                  if (!target.closest('.actions-container')) {
                    handleSelect(set.id);
                  }
                }}
              >
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  {category === "mcq" ? <LayoutList className="w-5 h-5 opacity-70 shrink-0" /> : <FileText className="w-5 h-5 opacity-70 shrink-0" />}
                  <div className="text-left flex-1 min-w-0">
                    {editingId === set.id ? (
                      <div className="flex items-center gap-2 actions-container">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`h-7 py-1 px-2 ${darkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white"}`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(set.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-green-500" onClick={(e) => { e.stopPropagation(); handleEditSave(set.id); }}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-red-500" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold truncate">{set.name}</div>
                        <div className="text-xs opacity-70">
                          {category === "mcq"
                            ? `${(set as any).mcqs?.length || 0} Questions`
                            : category === "Audio Flashcard"
                              ? `${(set as any).questions?.length || 0} Words`
                              : `${(set as any).passages?.length || 0} Passages`
                          }
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {editingId !== set.id && (
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity actions-container shrink-0 ml-2">
                    {deletingId === set.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500 font-medium">Delete?</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); handleDelete(set.id); }}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 hover:bg-slate-500/10" onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditName(set.name);
                          setEditingId(set.id); 
                        }}>
                          <Pencil className="w-4 h-4 opacity-70 hover:opacity-100 text-blue-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { 
                          e.stopPropagation(); 
                          setDeletingId(set.id); 
                        }}>
                          <Trash2 className="w-4 h-4 opacity-70 hover:opacity-100 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-2 border-t pt-4 border-slate-200 dark:border-slate-700">
          {!showNewInput ? (
            <Button
              onClick={() => setShowNewInput(true)}
              variant="outline"
              className={`w-full border-dashed ${darkMode ? "border-slate-600 hover:bg-slate-700 text-blue-400" : "text-blue-600"
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
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Creating..." : "Create"}
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
