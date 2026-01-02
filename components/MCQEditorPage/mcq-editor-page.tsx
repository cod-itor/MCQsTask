"use client";

import type React from "react";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MCQStructuredEditor } from "./mcq-structured-editor";
import { MCQJSONEditor } from "./mcq-json-editor";
import { ImportBehaviorModal } from "./import-behavior-modal";
import { SearchMcqs } from "./search-mcqs";
import { AddManualQuestion } from "./add-manual-question";
import { EditorActionsMenu } from "./editor-actions-menu";
import { parseJSONFile, exportMCQsToJSON } from "@/lib/mcq-file-handler";
import { validateMCQs } from "@/lib/mcq-validation";
import { Upload, AlertCircle, CheckCircle, FileText, Plus } from "lucide-react";
import type { MCQ } from "@/lib/types";

// Generate unique ID for MCQs using crypto.randomUUID
const generateUniqueId = () => {
  return crypto.randomUUID();
};

// Ensure all MCQs have unique IDs
const ensureUniqueIds = (mcqs: MCQ[]): MCQ[] => {
  const seenIds = new Set<string>();
  return mcqs.map((mcq) => {
    if (!mcq.id || seenIds.has(mcq.id)) {
      const newId = generateUniqueId();
      seenIds.add(newId);
      return { ...mcq, id: newId };
    }
    seenIds.add(mcq.id);
    return mcq;
  });
};

interface MCQEditorPageProps {
  onMcqsLoaded: () => void;
  darkMode: boolean;
  onBack?: () => void;
  context?: "full" | "practice";
  currentQuestionIndex?: number;
}

export function MCQEditorPage({
  onMcqsLoaded,
  darkMode,
  onBack,
  context = "full",
  currentQuestionIndex,
}: MCQEditorPageProps) {
  const { subjects, activeSubjectId, updateMcqsForSubject, getMcqsForSubject } =
    useSubjects();
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [lastValidMcqs, setLastValidMcqs] = useState<MCQ[]>([]);
  const [filteredMcqs, setFilteredMcqs] = useState<MCQ[]>([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"guided" | "json">("guided");
  const [showImportBehavior, setShowImportBehavior] = useState(false);
  const [pendingImportMcqs, setPendingImportMcqs] = useState<MCQ[]>([]);
  const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);

  const currentSubject = subjects.find((s) => s.id === activeSubjectId);
  const hasUnsavedChanges =
    JSON.stringify(mcqs) !== JSON.stringify(lastValidMcqs);

  // Hide navbar when component mounts
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
    if (activeSubjectId) {
      const subjectMcqs = getMcqsForSubject(activeSubjectId);
      const mcqsWithIds = ensureUniqueIds(subjectMcqs);
      setMcqs(mcqsWithIds);
      setFilteredMcqs(mcqsWithIds);
      setLastValidMcqs(mcqsWithIds);
    }
  }, [activeSubjectId, getMcqsForSubject, subjects]);

  useEffect(() => {
    setFilteredMcqs(mcqs);
  }, [mcqs]);

  useEffect(() => {
    if (saveMessage || errorMessage) {
      if (toastTimeout) clearTimeout(toastTimeout);
      const timeout = setTimeout(() => {
        setSaveMessage("");
        setErrorMessage("");
      }, 5000);
      setToastTimeout(timeout);
    }
  }, [saveMessage, errorMessage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setSaveMessage("");

    const result = await parseJSONFile(file);
    if (result.isValid && result.mcqs) {
      const mcqsWithIds = ensureUniqueIds(result.mcqs);
      setPendingImportMcqs(mcqsWithIds);
      setShowImportBehavior(true);
    } else {
      const errorDetails = result.errors
        .map(
          (e) =>
            `${e.mcqIndex >= 0 ? `MCQ ${e.mcqIndex + 1}` : "File"}: ${
              e.message
            }`
        )
        .join("\n");
      setErrorMessage(`Failed to load file:\n${errorDetails}`);
    }
  };

  const handleImportBehavior = (behavior: "override" | "add") => {
    if (behavior === "override") {
      setMcqs(pendingImportMcqs);
      setFilteredMcqs(pendingImportMcqs);
      setSaveMessage(
        `Successfully loaded ${pendingImportMcqs.length} MCQs (Overridden existing)`
      );
    } else {
      const combined = [...mcqs, ...pendingImportMcqs];
      setMcqs(combined);
      setFilteredMcqs(combined);
      setSaveMessage(
        `Successfully added ${pendingImportMcqs.length} MCQs (${combined.length} total)`
      );
    }
    setShowImportBehavior(false);
    setPendingImportMcqs([]);
  };

  const handleAddManualQuestion = (mcq: MCQ) => {
    const mcqWithId = { ...mcq, id: mcq.id || generateUniqueId() };
    const updated = [...mcqs, mcqWithId];
    setMcqs(updated);
    setFilteredMcqs(updated);
    setSaveMessage("Question added successfully");
    setShowAddManual(false);
  };

  const handleClearAll = () => {
    setMcqs([]);
    setFilteredMcqs([]);
    setLastValidMcqs([]);
    setSaveMessage(`Deleted all ${mcqs.length} questions`);
  };

  const handleSave = () => {
    if (!activeSubjectId) {
      setErrorMessage("Please select a subject first");
      return;
    }

    const validation = validateMCQs(mcqs);
    if (!validation.isValid) {
      const errorDetails = validation.errors
        .map((e) => `MCQ ${e.mcqIndex + 1}: ${e.message}`)
        .join("\n");
      setErrorMessage(`Validation failed:\n${errorDetails}`);
      return;
    }

    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    updateMcqsForSubject(activeSubjectId!, mcqs);
    setLastValidMcqs(mcqs);
    setSaveMessage(`Saved ${mcqs.length} MCQs to "${currentSubject?.name}"`);
    setErrorMessage("");
    setShowSaveDialog(false);

    setTimeout(() => {
      onMcqsLoaded();
    }, 1500);
  };

  const handleRollback = () => {
    setMcqs(lastValidMcqs);
    setFilteredMcqs(lastValidMcqs);
    setSaveMessage("Reverted to last saved state");
    setErrorMessage("");
  };

  const handleLoadExample = () => {
    const example = [
      {
        id: generateUniqueId(),
        q: "What is 2 + 2?",
        opts: ["3", "4", "5", "6"],
        answer: 1,
        explanation: "2 + 2 equals 4",
      },
    ];
    setMcqs(example as MCQ[]);
    setFilteredMcqs(example as MCQ[]);
    setSaveMessage("Example MCQs loaded");
  };

  const isEmptyState = mcqs.length === 0;
  const canSave = mcqs.length > 0 && activeSubjectId;
  const canRollback =
    mcqs.length > 0 && JSON.stringify(mcqs) !== JSON.stringify(lastValidMcqs);

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
    <div
      className={`fixed inset-0 overflow-y-auto transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="p-4">
        {/* Sticky Header */}
        <div
          className={`sticky top-0 z-20 border-b backdrop-blur-sm mb-4 -mx-4 px-4 ${
            darkMode
              ? "bg-slate-900/90 border-slate-700"
              : "bg-white/90 border-gray-200"
          }`}
        >
          <div className="max-w-7xl mx-auto py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
                <div>
                  <h1
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    MCQ Editor
                  </h1>
                  {currentSubject && (
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {currentSubject.name} • {mcqs.length} question
                      {mcqs.length !== 1 ? "s" : ""}
                      {hasUnsavedChanges && " • Unsaved changes"}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isEmptyState && (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={!canSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <EditorActionsMenu
                      onExport={() =>
                        exportMCQsToJSON(
                          mcqs,
                          `${currentSubject?.name || "mcqs"}.json`
                        )
                      }
                      onRollback={handleRollback}
                      onClearAll={handleClearAll}
                      canRollback={canRollback}
                      hasMcqs={mcqs.length > 0}
                      darkMode={darkMode}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Subject Warning */}
          {!activeSubjectId && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                darkMode
                  ? "bg-yellow-900/30 border border-yellow-700 text-yellow-100"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-900"
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">
                Please select a subject from the sidebar to start editing
              </p>
            </div>
          )}

          {/* Messages */}
          {saveMessage && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top ${
                darkMode
                  ? "bg-green-900/30 border border-green-700 text-green-100"
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>{saveMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-start gap-3 animate-in slide-in-from-top ${
                darkMode
                  ? "bg-red-900/30 border border-red-700 text-red-100"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Validation Error</p>
                <p className="text-sm whitespace-pre-line mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Empty State - Getting Started */}
          {isEmptyState && activeSubjectId && (
            <Card
              className={`border-2 border-dashed ${
                darkMode
                  ? "bg-slate-800/50 border-slate-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <CardContent className="py-12">
                <div className="text-center max-w-md mx-auto">
                  <FileText
                    className={`w-16 h-16 mx-auto mb-4 ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  />
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No Questions Yet
                  </h2>
                  <p
                    className={`mb-6 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Get started by adding questions to your collection
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="json-upload-empty"
                      />
                      <label htmlFor="json-upload-empty">
                        <Button
                          asChild
                          className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        >
                          <span>
                            <Upload className="w-4 h-4" />
                            Import JSON File
                          </span>
                        </Button>
                      </label>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setShowAddManual(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Manually
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleLoadExample}
                      className="gap-2"
                    >
                      Load Example
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Editor Content */}
          {!isEmptyState && (
            <div className="space-y-6">
              {/* Toolbar - Search and Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <SearchMcqs
                    mcqs={mcqs}
                    onFilterChange={setFilteredMcqs}
                    darkMode={darkMode}
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowAddManual(true)}
                    className="gap-2 flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="json-upload"
                    />
                    <label htmlFor="json-upload">
                      <Button
                        asChild
                        variant="outline"
                        className="gap-2 cursor-pointer"
                      >
                        <span>
                          <Upload className="w-4 h-4" />
                          Import
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Editor Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "guided" | "json")}
              >
                <TabsList
                  className={`grid w-full grid-cols-2 ${
                    darkMode ? "bg-slate-800" : ""
                  }`}
                >
                  <TabsTrigger value="guided">Visual Editor</TabsTrigger>
                  <TabsTrigger value="json">JSON Editor</TabsTrigger>
                </TabsList>

                <TabsContent value="guided" className="space-y-4 mt-6">
                  <MCQStructuredEditor
                    mcqs={mcqs}
                    onChange={setMcqs}
                    darkMode={darkMode}
                    displayedMcqs={filteredMcqs}
                  />
                </TabsContent>

                <TabsContent value="json" className="mt-6">
                  <MCQJSONEditor
                    mcqs={mcqs}
                    onChange={setMcqs}
                    darkMode={darkMode}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Modals */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent
            className={darkMode ? "bg-slate-800 border-slate-700" : ""}
          >
            <AlertDialogTitle>Save MCQs?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to save {mcqs.length} MCQ(s) to "
              {currentSubject?.name}
              ". This will replace the existing MCQs for this subject. All
              active exams and practice sessions will be reset.
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <ImportBehaviorModal
          open={showImportBehavior}
          onOpenChange={setShowImportBehavior}
          newMcqs={pendingImportMcqs}
          existingMcqCount={mcqs.length}
          onConfirm={handleImportBehavior}
          darkMode={darkMode}
        />

        <AlertDialog
          open={showUnsavedDialog}
          onOpenChange={setShowUnsavedDialog}
        >
          <AlertDialogContent
            className={darkMode ? "bg-slate-800 border-slate-700" : ""}
          >
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your MCQs. Are you sure you want to
              leave?
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmNavigation}
                className="bg-red-600 hover:bg-red-700"
              >
                Leave Anyway
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Manual Question Dialog */}
        {showAddManual && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="min-h-full py-40 w-full max-w-2xl">
              <AddManualQuestion
                onAdd={handleAddManualQuestion}
                onClose={() => setShowAddManual(false)}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
      </div>
      );
    </div>
  );
}
