"use client";

import { Badge } from "@/components/ui/badge";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionEditor } from "./question-editor";
import { X } from "lucide-react";
import { convertInternalIndexToUser } from "@/lib/mcq-validation";
import type { MCQ } from "@/lib/types";

interface MCQStructuredEditorProps {
  mcqs: MCQ[];
  onChange: (mcqs: MCQ[]) => void;
  darkMode: boolean;
  displayedMcqs?: MCQ[];
}

export function MCQStructuredEditor({
  mcqs,
  onChange,
  darkMode,
  displayedMcqs,
}: MCQStructuredEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [editingMcqIndex, setEditingMcqIndex] = useState<number | null>(null);

  const mcqsToDisplay = displayedMcqs || mcqs;

  const handleEditorSave = useCallback(
    (updatedMcq: MCQ) => {
      if (editingMcqIndex === null) return;

      const actualIndex = mcqs.findIndex(
        (m) => m.id === mcqsToDisplay[editingMcqIndex].id
      );
      if (actualIndex === -1) return;

      const updated = [...mcqs];
      updated[actualIndex] = updatedMcq;
      onChange(updated);
      setEditingMcqIndex(null);
    },
    [editingMcqIndex, mcqs, mcqsToDisplay, onChange]
  );

  const removeMCQ = useCallback(
    (index: number) => {
      const actualIndex = mcqs.findIndex(
        (m) => m.id === mcqsToDisplay[index].id
      );
      if (actualIndex === -1) return;

      const updated = mcqs.filter((_, i) => i !== actualIndex);
      onChange(updated);
      if (expandedIndex === index) {
        setExpandedIndex(null);
      }
    },
    [mcqs, mcqsToDisplay, onChange, expandedIndex]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (
      editingMcqIndex !== null &&
      editingMcqIndex < mcqsToDisplay.length - 1
    ) {
      const newIndex = editingMcqIndex + 1;
      setEditingMcqIndex(newIndex);
      setExpandedIndex(newIndex);
    }
  }, [editingMcqIndex, mcqsToDisplay.length]);

  const handlePrevious = useCallback(() => {
    if (editingMcqIndex !== null && editingMcqIndex > 0) {
      const newIndex = editingMcqIndex - 1;
      setEditingMcqIndex(newIndex);
      setExpandedIndex(newIndex);
    }
  }, [editingMcqIndex]);

  const handleJumpTo = useCallback(
    (questionNumber: number) => {
      // questionNumber is 1-based (what user sees), convert to 0-based index
      const newIndex = questionNumber - 1;

      console.log("=== Jump To Debug ===");
      console.log("Question number entered:", questionNumber);
      console.log("Converted to index:", newIndex);
      console.log("Total displayed questions:", mcqsToDisplay.length);
      console.log("Current editing index BEFORE:", editingMcqIndex);

      if (newIndex >= 0 && newIndex < mcqsToDisplay.length) {
        console.log("Valid index, setting to:", newIndex);
        const newMcq = mcqsToDisplay[newIndex];
        console.log("New MCQ ID:", newMcq?.id);
        console.log("New MCQ Question:", newMcq?.q?.substring(0, 50));

        // Force update by setting to null first
        setEditingMcqIndex(null);
        setExpandedIndex(null);

        // Use setTimeout to ensure state updates in sequence
        setTimeout(() => {
          setEditingMcqIndex(newIndex);
          setExpandedIndex(newIndex);
          console.log("State updated to index:", newIndex);
        }, 0);
      } else {
        console.log("Invalid index - out of range");
      }
    },
    [mcqsToDisplay]
  );

  if (editingMcqIndex !== null && expandedIndex === editingMcqIndex) {
    const mcqToEdit = mcqsToDisplay[editingMcqIndex];
    console.log("Rendering editor for index:", editingMcqIndex);
    console.log("Question number shown:", editingMcqIndex + 1);
    console.log("MCQ ID:", mcqToEdit?.id);

    return (
      <div className="space-y-4">
        <QuestionEditor
          key={`${mcqToEdit.id}-${editingMcqIndex}`}
          mode="edit"
          initialData={mcqToEdit}
          onSave={handleEditorSave}
          onCancel={() => setEditingMcqIndex(null)}
          darkMode={darkMode}
          questionNumber={editingMcqIndex + 1}
          totalQuestions={mcqsToDisplay.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onJumpTo={handleJumpTo}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mcqsToDisplay.map((mcq, displayIndex) => (
        <Card
          key={`mcq-${mcq.id || displayIndex}`}
          className={`cursor-pointer transition-all ${
            expandedIndex === displayIndex
              ? darkMode
                ? "border-blue-500 bg-slate-750"
                : "border-blue-400 bg-blue-50"
              : ""
          } ${darkMode ? "bg-slate-800 border-slate-700" : ""}`}
          onClick={() =>
            setExpandedIndex(
              expandedIndex === displayIndex ? null : displayIndex
            )
          }
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base line-clamp-2">
                  {mcq.q || "Untitled Question"}
                </CardTitle>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {mcq.opts.length} options
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      darkMode
                        ? "bg-green-900 text-green-100"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    Answer: {convertInternalIndexToUser(mcq.answer)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIndex(displayIndex);
                    setEditingMcqIndex(displayIndex);
                  }}
                  className={`text-blue-500 hover:bg-blue-50 hover:text-blue-600 ${
                    darkMode ? "hover:bg-slate-700" : ""
                  }`}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMCQ(displayIndex);
                  }}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}

      {mcqsToDisplay.length === 0 && (
        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <CardContent className="p-8 text-center text-muted-foreground">
            {mcqs.length > 0
              ? "No MCQs match your search."
              : "No MCQs yet. Import or create MCQs to begin editing."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
