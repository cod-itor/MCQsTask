"use client";

import type React from "react";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ListeningStructuredEditor } from "./listening-structured-editor";
import { ListeningJSONEditor } from "./listening-json-editor";
import { ImportBehaviorModal } from "@/components/MCQEditorPage/import-behavior-modal";
import { EditorActionsMenu } from "@/components/MCQEditorPage/editor-actions-menu";
import { HowToImportModal } from "@/components/how-to-import-modal";
import { SearchListening } from "./search-listening";
import { parseListeningJSONFile, exportListeningToJSON } from "@/lib/listening-file-handler";
import { toast } from "sonner";
import { validateListeningQuestions } from "@/lib/listening-validation";
import { Upload, AlertCircle, CheckCircle, FileText, Plus, Loader2 } from "lucide-react";
import type { ListeningQuestion } from "@/lib/types";
import { motion } from "framer-motion";

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

export function ListeningEditorPage({
  onLoaded,
  darkMode,
  onBack,
}: ListeningEditorPageProps) {
  const { subjects, activeSubjectId, activeListeningSetId, getListeningSet, updateListeningSet, createListeningSet, setActiveListeningSet } = useSubjects();
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<ListeningQuestion[]>([]);
  const [lastValidQuestions, setLastValidQuestions] = useState<ListeningQuestion[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"guided" | "json">("guided");
  const [showImportBehavior, setShowImportBehavior] = useState(false);
  const [pendingImportQuestions, setPendingImportQuestions] = useState<ListeningQuestion[]>([]);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        setFilteredQuestions(withIds);
        setLastValidQuestions(withIds);
      }
    } else {
      setQuestions([]);
      setFilteredQuestions([]);
      setLastValidQuestions([]);
    }
  }, [activeSubjectId, activeListeningSetId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    } catch (err) { }

    const result = await parseListeningJSONFile(file);
    if (result.isValid && result.questions) {
      const withIds = ensureUniqueIds(result.questions);
      setPendingImportQuestions(withIds);
      setShowImportBehavior(true);
    } else {
      const errorDetails = result.errors
        .map((e) => `${e.questionIndex >= 0 ? `Word ${e.questionIndex + 1}` : "File"}: ${e.message}`)
        .join("\n");
      toast.error(`Failed to load file:\n${errorDetails}`);
    }
    e.target.value = '';
  };

  const handleImportBehavior = async (behavior: "override" | "add" | "new", newSetName?: string) => {
    if (behavior === "new" && activeSubjectId) {
      const defaultName = newSetName?.trim() || `New Set`;
      const newId = await createListeningSet(activeSubjectId, defaultName, pendingImportQuestions);
      setActiveListeningSet(newId);

      setQuestions(pendingImportQuestions);
      setFilteredQuestions(pendingImportQuestions);
      toast.success(`Successfully created "${defaultName}" with ${pendingImportQuestions.length} Words`);
    } else if (behavior === "override") {
      setQuestions(pendingImportQuestions);
      setFilteredQuestions(pendingImportQuestions);
      toast.success(`Successfully loaded ${pendingImportQuestions.length} Words (Overridden existing)`);
    } else {
      const combined = [...questions, ...pendingImportQuestions];
      setQuestions(combined);
      setFilteredQuestions(combined);
      toast.success(`Successfully added ${pendingImportQuestions.length} Words (${combined.length} total)`);
    }
    setShowImportBehavior(false);
    setPendingImportQuestions([]);
  };

  const handleClearAll = () => {
    setQuestions([]);
    setFilteredQuestions([]);
    setLastValidQuestions([]);
    toast.success(`Deleted all words`);
  };

  const handleSave = () => {
    if (!activeSubjectId) {
      toast.error("Please select a subject first");
      return;
    }

    const validation = validateListeningQuestions(questions);
    if (!validation.isValid) {
      const errorDetails = validation.errors
        .map((e) => `Word ${e.questionIndex + 1}: ${e.message}`)
        .join("\n");
      toast.error(`Validation failed:\n${errorDetails}`);
      return;
    }

    const payloadString = JSON.stringify(questions);
    const sizeInBytes = new Blob([payloadString]).size;
    // Next.js Server Actions limit is 5MB. We check against 4.8MB to be safe.
    if (sizeInBytes > 4800000) {
      toast.error(`Error: Data size is ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB, which exceeds the 5MB limit. Please remove or compress some images.`);
      return;
    }

    setShowSaveDialog(true);
  };

  const confirmSave = async () => {
    if (!activeSubjectId || !activeListeningSetId) return;
    setIsSaving(true);
    try {
      await updateListeningSet(activeSubjectId, activeListeningSetId, questions);
      setLastValidQuestions(questions);
      toast.success(`Saved ${questions.length} Words to "${currentSet?.name || 'Set'}"`);
      setShowSaveDialog(false);

      setTimeout(() => {
        onLoaded();
      }, 1500);
    } catch (error) {
      toast.error("Failed to save words");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = () => {
    setQuestions(lastValidQuestions);
    setFilteredQuestions(lastValidQuestions);
    toast.success("Reverted to last saved state");
  };

  const handleLoadExample = () => {
    const example = [{
      id: generateUniqueId(),
      q: "Example Word",
      a: "Example Translation"
    }];
    setQuestions(example as ListeningQuestion[]);
    setFilteredQuestions(example as ListeningQuestion[]);
    toast.success("Example word loaded");
  };

  const handleAddManual = () => {
    const newQ: ListeningQuestion = {
      id: generateUniqueId(),
      q: "New word",
    };
    const updated = [newQ, ...questions];
    setQuestions(updated);
    setFilteredQuestions(updated);
    toast.success("New word added");
    setActiveTab("guided");
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

  const canSave = questions.length > 0 && hasUnsavedChanges;
  const canRollback = hasUnsavedChanges;
  const isEmptyState = questions.length === 0;

  return (
    <div
      className={`fixed inset-0 overflow-y-auto pb-12 transition-colors duration-300 z-50 ${
        darkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-5xl mx-auto pt-6 px-4 pb-8 space-y-6">
        {/* Header Section */}
        <div
          className={`sticky top-0 z-40 -mx-4 px-4 py-4 mb-6 border-b backdrop-blur-md ${
            darkMode
              ? "bg-slate-900/80 border-slate-700"
              : "bg-white/80 border-gray-200 shadow-sm"
          }`}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className={darkMode ? "hover:bg-slate-800" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Listening Editor
                </h1>
                {currentSubject && currentSet && (
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {currentSubject.name} &gt; {currentSet.name} • {questions.length} word
                    {questions.length !== 1 ? "s" : ""}
                    {hasUnsavedChanges && " • Unsaved changes"}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {!isEmptyState && (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={!canSave || isSaving}
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <EditorActionsMenu
                    onExport={() =>
                      exportListeningToJSON(
                        questions,
                        `${currentSubject?.name || "listening"}.json`
                      )
                    }
                    onRollback={handleRollback}
                    onClearAll={handleClearAll}
                    canRollback={canRollback}
                    hasMcqs={questions.length > 0}
                    darkMode={darkMode}
                  />
                  <HowToImportModal category="Audio Flashcard" darkMode={darkMode} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Subject Warning */}
          {(!activeSubjectId || !activeListeningSetId) && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                darkMode
                  ? "bg-yellow-900/30 border border-yellow-700 text-yellow-100"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-900"
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">
                Please select a file from the dashboard to start editing
              </p>
            </div>
          )}

          {/* Empty State */}
          {isEmptyState && activeSubjectId && activeListeningSetId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                className={`border-2 border-dashed ${
                  darkMode
                    ? "bg-slate-800/50 border-slate-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <CardContent className="py-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="text-4xl mb-3">🎧</div>
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No Words Yet
                  </h2>
                  <p
                    className={`mb-6 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Get started by adding words or importing a JSON file
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
                          className="gap-2 w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
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
                      onClick={handleAddManual}
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

                    <HowToImportModal category="Audio Flashcard" darkMode={darkMode} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}

          {/* Main Editor Content */}
          {!isEmptyState && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1 w-full">
                  <SearchListening
                    questions={questions}
                    onFilterChange={setFilteredQuestions}
                    darkMode={darkMode}
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleAddManual}
                    className="gap-2 flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Word
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
                  <ListeningStructuredEditor
                    questions={questions}
                    onChange={setQuestions}
                    displayedQuestions={filteredQuestions}
                    darkMode={darkMode}
                  />
                </TabsContent>

                <TabsContent value="json" className="mt-6">
                  <ListeningJSONEditor
                    questions={questions}
                    onChange={setQuestions}
                    darkMode={darkMode}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent
            className={darkMode ? "bg-slate-800 border-slate-700" : ""}
          >
            <AlertDialogTitle>Save Words?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to save {questions.length} Word(s) to "
              {currentSubject?.name} &gt; {currentSet?.name}
              ". This will replace the existing words for this file.
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel
                disabled={isSaving}
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              >
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={confirmSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        <ImportBehaviorModal
          open={showImportBehavior}
          onOpenChange={setShowImportBehavior}
          newMcqs={pendingImportQuestions}
          existingMcqCount={questions.length}
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
              You have unsaved changes. Are you sure you want to leave without
              saving?
            </AlertDialogDescription>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              >
                Stay
              </AlertDialogCancel>
              <Button
                onClick={confirmNavigation}
                variant="destructive"
              >
                Leave Without Saving
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
