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
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import type { MCQ } from "@/lib/types";

// Generate unique ID for MCQs using crypto.randomUUID
const generateUniqueId = () => {
  return crypto.randomUUID();
};

// Ensure all MCQs have unique IDs
const ensureUniqueIds = (mcqs: MCQ[]): MCQ[] => {
  const seenIds = new Set<string>();
  return mcqs.map((mcq) => {
    // If no ID or duplicate ID, generate new one
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
  const [pendingNavigation, setPendingNavigation] = useState(false);

  const currentSubject = subjects.find((s) => s.id === activeSubjectId);
  const hasUnsavedChanges =
    JSON.stringify(mcqs) !== JSON.stringify(lastValidMcqs);

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
      className={`min-h-screen p-4 py-12 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className={`${darkMode ? "bg-slate-800 border-slate-600" : ""}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            )}
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              MCQ Editor
            </h1>
          </div>
          {activeSubjectId ? (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-blue-900 border border-blue-700 text-blue-100"
                  : "bg-blue-50 border border-blue-200 text-blue-900"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <p className="font-semibold">Subject: {currentSubject?.name}</p>
            </div>
          ) : (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-yellow-900 border border-yellow-700 text-yellow-100"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-900"
              }`}
            >
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold">
                Please select a subject from the sidebar first
              </p>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <Card
          className={`mb-6 ${darkMode ? "bg-slate-800 border-slate-700" : ""}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import MCQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1">
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
                    className="w-full md:w-auto cursor-pointer bg-transparent"
                  >
                    <span>Upload JSON File</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a .json file with MCQs in the standard format
                </p>
              </div>

              {isEmptyState && (
                <Button
                  variant="outline"
                  onClick={handleLoadExample}
                  className="w-full md:w-auto bg-transparent"
                >
                  Load Example
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {saveMessage && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              darkMode
                ? "bg-green-900 border border-green-700 text-green-100"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>{saveMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              darkMode
                ? "bg-red-900 border border-red-700 text-red-100"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Validation Error</p>
              <p className="text-sm whitespace-pre-line">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Add Manual Question */}
        {activeSubjectId && (
          <AddManualQuestion
            onAdd={handleAddManualQuestion}
            darkMode={darkMode}
          />
        )}

        {/* Search Section */}
        {mcqs.length > 0 && (
          <div className="mb-6">
            <SearchMcqs
              mcqs={mcqs}
              onFilterChange={setFilteredMcqs}
              darkMode={darkMode}
            />
          </div>
        )}

        {/* Editor Tabs */}
        {mcqs.length > 0 && (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "guided" | "json")}
            className="mb-6"
          >
            <TabsList
              className={`grid w-full grid-cols-2 ${
                darkMode ? "bg-slate-800" : ""
              }`}
            >
              <TabsTrigger value="guided" className="relative">
                Editor (Recommended)
              </TabsTrigger>
              <TabsTrigger value="json">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="guided" className="space-y-4">
              <MCQStructuredEditor
                mcqs={mcqs}
                onChange={setMcqs}
                darkMode={darkMode}
                displayedMcqs={filteredMcqs}
              />
            </TabsContent>

            <TabsContent value="json">
              <MCQJSONEditor
                mcqs={mcqs}
                onChange={setMcqs}
                darkMode={darkMode}
              />
            </TabsContent>
          </Tabs>
        )}

        <div className="md:static md:bottom-auto md:bg-transparent md:from-transparent md:pt-0 md:pb-0 md:mx-0 md:px-0 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-800  dark:from-slate-900 to-transparent pt-4 pb-4 px-4 flex gap-3 flex-col sm:flex-row flex-wrap z-10">
          {!isEmptyState && (
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-w-fit sm:flex-none"
            >
              Save MCQs to "{currentSubject?.name || "Subject"}"
            </Button>
          )}

          <EditorActionsMenu
            onExport={() =>
              exportMCQsToJSON(mcqs, `${currentSubject?.name || "mcqs"}.json`)
            }
            onRollback={handleRollback}
            onClearAll={handleClearAll}
            canRollback={canRollback}
            hasMcqs={mcqs.length > 0}
            darkMode={darkMode}
          />
        </div>

        {/* Save Confirmation Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent
            className={darkMode ? "bg-slate-800 border-slate-700" : ""}
          >
            <AlertDialogTitle>Save MCQs?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to save {mcqs.length} MCQ(s) to "
              {currentSubject?.name}". This will replace the existing MCQs for
              this subject. All active exams and practice sessions will be
              reset.
            </AlertDialogDescription>
            <div className="flex gap-3">
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

        {/* Unsaved Changes Confirmation Dialog */}
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
            <div className="flex gap-3">
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
      </div>
    </div>
  );
}
