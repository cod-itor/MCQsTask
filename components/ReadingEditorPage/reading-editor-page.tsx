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
import { ReadingStructuredEditor } from "./reading-structured-editor";
import { ReadingJSONEditor } from "./reading-json-editor";
import { ImportBehaviorModal } from "@/components/MCQEditorPage/import-behavior-modal";
import { EditorActionsMenu } from "@/components/MCQEditorPage/editor-actions-menu";
import { HowToImportModal } from "@/components/how-to-import-modal";
import { parseReadingJSONFile, exportReadingToJSON } from "@/lib/reading-file-handler";
import { toast } from "sonner";
import { validateReadingPassages } from "@/lib/reading-validation";
import { Upload, AlertCircle, CheckCircle, FileText, Plus, Loader2 } from "lucide-react";
import type { ReadingPassage } from "@/lib/types";
import { motion } from "framer-motion";
import { SearchReading } from "./search-reading";

const generateUniqueId = () => crypto.randomUUID();

const ensureUniqueIds = (passages: ReadingPassage[]): ReadingPassage[] => {
  const seenIds = new Set<string>();
  return passages.map((passage) => {
    let passageId = passage.id;
    if (!passageId || seenIds.has(passageId)) {
      passageId = generateUniqueId();
    }
    seenIds.add(passageId);
    
    const seenQIds = new Set<string>();
    const newQs = passage.questions.map(q => {
      let qId = q.id;
      if (!qId || seenQIds.has(qId)) {
        qId = generateUniqueId();
      }
      seenQIds.add(qId);
      return { ...q, id: qId };
    });

    return { ...passage, id: passageId, questions: newQs };
  });
};

interface ReadingEditorPageProps {
  onReadingLoaded: () => void;
  darkMode: boolean;
  onBack?: () => void;
}

export function ReadingEditorPage({
  onReadingLoaded,
  darkMode,
  onBack,
}: ReadingEditorPageProps) {
  const { subjects, activeSubjectId, activeReadingSetId, getReadingSet, updateReadingSet, createReadingSet, setActiveReadingSet, readingSets } = useSubjects();
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [filteredPassages, setFilteredPassages] = useState<ReadingPassage[]>([]);
  const [lastValidPassages, setLastValidPassages] = useState<ReadingPassage[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"guided" | "json">("guided");
  const [showImportBehavior, setShowImportBehavior] = useState(false);
  const [pendingImportPassages, setPendingImportPassages] = useState<ReadingPassage[]>([]);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentSubject = subjects.find((s) => s.id === activeSubjectId);
  const currentSet = getReadingSet(activeSubjectId, activeReadingSetId);
  const hasUnsavedChanges = JSON.stringify(passages) !== JSON.stringify(lastValidPassages);

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
    if (activeSubjectId && activeReadingSetId) {
      const subjectSet = getReadingSet(activeSubjectId, activeReadingSetId);
      if (subjectSet) {
        const passagesWithIds = ensureUniqueIds(subjectSet.passages);
        setPassages(passagesWithIds);
        setFilteredPassages(passagesWithIds);
        setLastValidPassages(passagesWithIds);
      }
    } else {
      setPassages([]);
      setFilteredPassages([]);
      setLastValidPassages([]);
    }
  }, [activeSubjectId, activeReadingSetId, readingSets]);

  // Messages are now handled entirely by sonner toasts

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (("q" in parsed[0] || "question" in parsed[0] || "opts" in parsed[0] || "options" in parsed[0]) && ("opts" in parsed[0] || "options" in parsed[0])) {
          toast.error("This file is for MCQs. Please import it in the MCQ editor.");
          // reset the input so they can upload again if needed
          e.target.value = '';
          return;
        }
        if (("q" in parsed[0] || "word" in parsed[0] || "question" in parsed[0]) && !("opts" in parsed[0] || "options" in parsed[0])) {
          toast.error("This file is for Flashcard Practice. Please import it in the Listening editor.");
          e.target.value = '';
          return;
        }
      }
    } catch (err) {
      // Ignore JSON parse errors here; parseReadingJSONFile will catch and report them
    }

    const result = await parseReadingJSONFile(file);
    if (result.isValid && result.passages) {
      const passagesWithIds = ensureUniqueIds(result.passages);
      setPendingImportPassages(passagesWithIds);
      setShowImportBehavior(true);
    } else {
      const errorDetails = result.errors
        .map((e) => `${e.passageIndex >= 0 ? `Passage ${e.passageIndex + 1}` : "File"}: ${e.message}`)
        .join("\n");
      toast.error(`Failed to load file:\n${errorDetails}`);
    }
  };

  const handleImportBehavior = async (behavior: "override" | "add" | "new", newSetName?: string) => {
    if (behavior === "new" && activeSubjectId) {
      const defaultName = newSetName?.trim() || `New Set`;
      const newId = await createReadingSet(activeSubjectId, defaultName, pendingImportPassages);
      
      setActiveReadingSet(newId);
      
      setPassages(pendingImportPassages);
      setFilteredPassages(pendingImportPassages);
      toast.success(`Successfully created "${defaultName}" with ${pendingImportPassages.length} Passages`);
    } else if (behavior === "override") {
      setPassages(pendingImportPassages);
      setFilteredPassages(pendingImportPassages);
      toast.success(`Successfully loaded ${pendingImportPassages.length} Passages (Overridden existing)`);
    } else {
      const combined = [...passages, ...pendingImportPassages];
      setPassages(combined);
      setFilteredPassages(combined);
      toast.success(`Successfully added ${pendingImportPassages.length} Passages (${combined.length} total)`);
    }
    setShowImportBehavior(false);
    setPendingImportPassages([]);
  };

  const handleClearAll = () => {
    setPassages([]);
    setFilteredPassages([]);
    setLastValidPassages([]);
    toast.success(`Deleted all passages`);
  };

  const handleSave = () => {
    if (!activeSubjectId) {
      toast.error("Please select a subject first");
      return;
    }

    const validation = validateReadingPassages(passages);
    if (!validation.isValid) {
      const errorDetails = validation.errors
        .map((e) => `Passage ${e.passageIndex + 1}: ${e.message}`)
        .join("\n");
      toast.error(`Validation failed:\n${errorDetails}`);
      return;
    }

    setShowSaveDialog(true);
  };

  const confirmSave = async () => {
    if (!activeSubjectId || !activeReadingSetId) return;
    setIsSaving(true);
    try {
      await updateReadingSet(activeSubjectId, activeReadingSetId, passages);
      setLastValidPassages(passages);
      toast.success(
        `Saved ${passages.length} passages to "${currentSet?.name || "Set"}"`
      );
      setShowSaveDialog(false);

      setTimeout(() => {
        onReadingLoaded();
      }, 1500);
    } catch (e) {
      toast.error("Failed to save reading passages");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = () => {
    setPassages(lastValidPassages);
    setFilteredPassages(lastValidPassages);
    toast.success("Reverted to last saved state");
  };

  const handleLoadExample = () => {
    const example = [{
      id: generateUniqueId(),
      header: "Example Passage",
      content: "This is a [blank] passage.",
      questions: [{
        id: "1",
        text: "This is a [blank] passage.",
        answer: "sample",
        options: ["sample", "real"]
      }],
      globalOptions: ["sample", "real"]
    }];
    setPassages(example as ReadingPassage[]);
    setFilteredPassages(example as ReadingPassage[]);
    toast.success("Example passage loaded");
  };

  const handleAddManualPassage = () => {
    const newPassage: ReadingPassage = {
      id: generateUniqueId(),
      header: "New Passage",
      content: "Enter your content here with a [blank] placeholder.",
      questions: [{
        id: generateUniqueId(),
        text: "Enter your question here containing [blank].",
        answer: "",
        options: ["Option 1", "Option 2"]
      }],
      globalOptions: []
    };
    const updated = [newPassage, ...passages];
    setPassages(updated);
    setFilteredPassages(updated);
    toast.success("New passage added");
    setActiveTab("guided");
  };

  const isEmptyState = passages.length === 0;
  const canSave = passages.length > 0 && activeSubjectId;
  const canRollback = passages.length > 0 && JSON.stringify(passages) !== JSON.stringify(lastValidPassages);

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
                    Reading Passages Editor
                  </h1>
                  {currentSubject && currentSet && (
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {currentSubject.name} &gt; {currentSet.name} • {passages.length} passage
                      {passages.length !== 1 ? "s" : ""}
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <EditorActionsMenu
                      onExport={() =>
                        exportReadingToJSON(
                          passages,
                          `${currentSubject?.name || "reading"}.json`
                        )
                      }
                      onRollback={handleRollback}
                      onClearAll={handleClearAll}
                      canRollback={canRollback}
                      hasMcqs={passages.length > 0}
                      darkMode={darkMode}
                    />
                    <HowToImportModal category="reading" darkMode={darkMode} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Subject Warning */}
          {(!activeSubjectId || !activeReadingSetId) && (
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
          {isEmptyState && activeSubjectId && activeReadingSetId && (
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
                    No Reading Passages Yet
                  </h2>
                  <p
                    className={`mb-6 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Get started by adding reading passages to your collection
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
                      onClick={handleAddManualPassage}
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

                    <HowToImportModal category="reading" darkMode={darkMode} />
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
                  <SearchReading
                    passages={passages}
                    onFilterChange={setFilteredPassages}
                    darkMode={darkMode}
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleAddManualPassage}
                    className="gap-2 flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Add Passage
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
                  <ReadingStructuredEditor
                    passages={passages}
                    onChange={setPassages}
                    displayedPassages={filteredPassages}
                    darkMode={darkMode}
                  />
                </TabsContent>

                <TabsContent value="json" className="mt-6">
                  <ReadingJSONEditor
                    passages={passages}
                    onChange={setPassages}
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
            <AlertDialogTitle>Save Passages?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to save {passages.length} Passage(s) to "
              {currentSubject?.name} &gt; {currentSet?.name}
              ". This will replace the existing passages for this file.
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

        {/* Reuse ImportBehaviorModal from MCQ */}
        <ImportBehaviorModal
          open={showImportBehavior}
          onOpenChange={setShowImportBehavior}
          newMcqs={pendingImportPassages as any}
          existingMcqCount={passages.length}
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
              You have unsaved changes in your passages. Are you sure you want to
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
      </div>
    </div>
  );
}
