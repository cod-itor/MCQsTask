"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Upload, AlertCircle, CheckCircle, FileText, Plus, Trash2 } from "lucide-react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImportBehaviorModal } from "@/components/MCQEditorPage/import-behavior-modal";
import { parseListeningJSONFile, exportListeningToJSON } from "@/lib/listening-file-handler";
import { toast } from "sonner";
import { validateListeningQuestions } from "@/lib/listening-validation";
import type { ListeningQuestion } from "@/lib/types";

const generateUniqueId = () => crypto.randomUUID();

const ensureUniqueIds = (questions: ListeningQuestion[]): ListeningQuestion[] => {
  const seenIds = new Set<string>();
  return questions.map((q) => {
    if (!q.id || seenIds.has(q.id)) {
      const newId = generateUniqueId();
      seenIds.add(newId);
      return { ...q, id: newId };
    }
    seenIds.add(q.id);
    return q;
  });
};

interface ListeningEditorPageProps {
  onLoaded: () => void;
  darkMode: boolean;
  onBack?: () => void;
}

export function ListeningEditorPage({ onLoaded, darkMode, onBack }: ListeningEditorPageProps) {
  const { subjects, activeSubjectId, activeListeningSetId, getListeningSet, updateListeningSet, createListeningSet, setActiveListeningSet } = useSubjects();
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [lastValidQuestions, setLastValidQuestions] = useState<ListeningQuestion[]>([]);
  
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportBehavior, setShowImportBehavior] = useState(false);
  const [pendingImportQuestions, setPendingImportQuestions] = useState<ListeningQuestion[]>([]);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const currentSubject = subjects.find((s) => s.id === activeSubjectId);
  const currentSet = getListeningSet(activeSubjectId, activeListeningSetId);
  const hasUnsavedChanges = JSON.stringify(questions) !== JSON.stringify(lastValidQuestions);

  useEffect(() => {
    document.body.classList.add("exam-mode");
    document.documentElement.classList.add("exam-mode");
    window.scrollTo(0, 0);

    return () => {
      document.body.classList.remove("exam-mode");
      document.documentElement.classList.remove("exam-mode");
    };
  }, []);

  useEffect(() => {
    if (activeSubjectId && activeListeningSetId) {
      const subjectSet = getListeningSet(activeSubjectId, activeListeningSetId);
      if (subjectSet) {
        const withIds = ensureUniqueIds(subjectSet.questions);
        setQuestions(withIds);
        setLastValidQuestions(withIds);
      }
    } else {
      setQuestions([]);
      setLastValidQuestions([]);
    }
  }, [activeSubjectId, activeListeningSetId]);

  useEffect(() => {
    if (saveMessage || errorMessage) {
      const timeout = setTimeout(() => {
        setSaveMessage("");
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [saveMessage, errorMessage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSaveMessage("");

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if ("opts" in parsed[0] || "options" in parsed[0]) {
          toast.error("This file is for MCQs. Please import it in the MCQ editor.");
          e.target.value = '';
          return;
        }
        if ("header" in parsed[0] || "content" in parsed[0]) {
          toast.error("This file is for Reading Passages. Please import it in the Reading editor.");
          e.target.value = '';
          return;
        }
      }
    } catch (err) {}

    const result = await parseListeningJSONFile(file);
    if (result.isValid && result.questions) {
      const withIds = ensureUniqueIds(result.questions);
      setPendingImportQuestions(withIds);
      setShowImportBehavior(true);
    } else {
      const errorDetails = result.errors
        .map((e) => `${e.questionIndex >= 0 ? `Word ${e.questionIndex + 1}` : "File"}: ${e.message}`)
        .join("\n");
      setErrorMessage(`Failed to load file:\n${errorDetails}`);
    }
  };

  const handleImportBehavior = (behavior: "override" | "add" | "new", newSetName?: string) => {
    if (behavior === "new" && activeSubjectId) {
      const defaultName = newSetName?.trim() || `New Set`;
      const newId = createListeningSet(activeSubjectId, defaultName);
      
      updateListeningSet(activeSubjectId, newId, pendingImportQuestions);
      setActiveListeningSet(newId);
      
      setQuestions(pendingImportQuestions);
      setSaveMessage(`Successfully created "${defaultName}" with ${pendingImportQuestions.length} Words`);
    } else if (behavior === "override") {
      setQuestions(pendingImportQuestions);
      setSaveMessage(`Successfully loaded ${pendingImportQuestions.length} Words (Overridden existing)`);
    } else {
      const combined = [...questions, ...pendingImportQuestions];
      setQuestions(combined);
      setSaveMessage(`Successfully added ${pendingImportQuestions.length} Words (${combined.length} total)`);
    }
    setShowImportBehavior(false);
    setPendingImportQuestions([]);
  };

  const handleClearAll = () => {
    setQuestions([]);
    setLastValidQuestions([]);
    setSaveMessage(`Deleted all words`);
  };

  const handleSave = () => {
    if (!activeSubjectId) {
      setErrorMessage("Please select a subject first");
      return;
    }

    const validation = validateListeningQuestions(questions);
    if (!validation.isValid) {
      const errorDetails = validation.errors
        .map((e) => `Word ${e.questionIndex + 1}: ${e.message}`)
        .join("\n");
      setErrorMessage(`Validation failed:\n${errorDetails}`);
      return;
    }

    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    if (!activeSubjectId || !activeListeningSetId) return;
    updateListeningSet(activeSubjectId, activeListeningSetId, questions);
    setLastValidQuestions(questions);
    setSaveMessage(`Saved ${questions.length} Words to "${currentSet?.name || 'Set'}"`);
    setErrorMessage("");
    setShowSaveDialog(false);

    setTimeout(() => {
      onLoaded();
    }, 1500);
  };

  const handleRollback = () => {
    setQuestions(lastValidQuestions);
    setSaveMessage("Reverted to last saved state");
    setErrorMessage("");
  };

  const handleAddManual = () => {
    const newQ: ListeningQuestion = {
      id: generateUniqueId(),
      q: "New word",
    };
    setQuestions([newQ, ...questions]);
    setSaveMessage("New word added");
  };

  const handleUpdateWord = (id: string, newWord: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, q: newWord } : q));
  };

  const handleDeleteWord = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onBack?.();
    }
  };

  const confirmNavigation = () => {
    setShowUnsavedDialog(false);
    onBack?.();
  };

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-300 ${darkMode ? "bg-slate-900" : "bg-gray-50"}`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 border-b ${darkMode ? "bg-slate-900/90 border-slate-700/50" : "bg-white/90 border-gray-200"} backdrop-blur-md shadow-sm`}>
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className={darkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-gray-100 text-gray-600"}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Listening Editor
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                  {currentSubject?.name || "No Subject Selected"} 
                  {currentSet && <span className="mx-2">•</span>}
                  {currentSet?.name && <span className="font-medium">{currentSet.name}</span>}
                </span>
                {hasUnsavedChanges && (
                  <span className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-pulse"></span>
                    Unsaved Changes
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <Button
              onClick={handleSave}
              disabled={questions.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save & Start
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Status Messages */}
        {errorMessage && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${darkMode ? "bg-red-900/20 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap text-sm font-sans">{errorMessage}</pre>
          </div>
        )}
        
        {saveMessage && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${darkMode ? "bg-green-900/20 border-green-500/30 text-green-400" : "bg-green-50 border-green-200 text-green-700"}`}>
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{saveMessage}</p>
          </div>
        )}

        {/* Action Bar */}
        <Card className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"} shadow-sm`}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <Button onClick={handleAddManual} variant="outline" className={darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-50"}>
                  <Plus className="w-4 h-4 mr-2" /> Add Word
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className={darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-50"}>
                    <Upload className="w-4 h-4 mr-2" /> Import JSON
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {questions.length > 0 && (
                  <>
                    <Button variant="outline" onClick={() => exportListeningToJSON(questions, `${currentSet?.name || 'listening'}.json`)} className={darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-50"}>
                      <FileText className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button variant="outline" onClick={handleClearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/30">
                      Clear All
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Area */}
        <Card className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className={`text-lg ${darkMode ? "text-slate-200" : "text-gray-800"}`}>
                Words List ({questions.length})
              </CardTitle>
              {hasUnsavedChanges && (
                <Button variant="ghost" size="sm" onClick={handleRollback} className="text-xs text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-500 dark:hover:bg-yellow-900/20">
                  Revert Changes
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className={`text-center py-12 border-2 border-dashed rounded-xl ${darkMode ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50"}`}>
                <div className="text-4xl mb-3">🎧</div>
                <h3 className={`text-lg font-medium mb-1 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>No words yet</h3>
                <p className={`text-sm mb-4 ${darkMode ? "text-slate-500" : "text-gray-500"}`}>Add words manually or import a JSON file.</p>
                <div className="relative inline-block">
                  <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">Import JSON</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, i) => (
                  <div key={q.id} className={`flex items-center gap-3 p-3 rounded-lg border ${darkMode ? "bg-slate-900/50 border-slate-700" : "bg-white border-gray-200 shadow-sm"}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${darkMode ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-500"}`}>
                      {i + 1}
                    </div>
                    <Input
                      value={q.q}
                      onChange={(e) => handleUpdateWord(q.id, e.target.value)}
                      placeholder="Enter word or phrase"
                      className={`flex-1 ${darkMode ? "bg-slate-800 border-slate-600 text-white" : ""}`}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteWord(q.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className={darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}>
          <AlertDialogTitle>Save Changes</AlertDialogTitle>
          <AlertDialogDescription className={darkMode ? "text-slate-400" : ""}>
            Are you sure you want to save {questions.length} words to "{currentSet?.name || 'this set'}"?
          </AlertDialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <AlertDialogCancel className={darkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="bg-purple-600 hover:bg-purple-700 text-white border-0">Save & Continue</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className={darkMode ? "bg-slate-800 border-slate-700 text-white" : ""}>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription className={darkMode ? "text-slate-400" : ""}>
            You have unsaved changes. Are you sure you want to leave without saving? Your changes will be lost.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <AlertDialogCancel className={darkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation} className="bg-red-600 hover:bg-red-700 text-white border-0">Leave Without Saving</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Behavior Dialog */}
      <ImportBehaviorModal
        open={showImportBehavior}
        onOpenChange={(open) => {
          setShowImportBehavior(open);
          if (!open) setPendingImportQuestions([]);
        }}
        onConfirm={handleImportBehavior}
        newMcqs={pendingImportQuestions}
        existingMcqCount={questions.length}
        darkMode={darkMode}
      />
    </div>
  );
}
