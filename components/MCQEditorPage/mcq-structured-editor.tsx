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

  if (editingMcqIndex !== null && expandedIndex === editingMcqIndex) {
    const mcqToEdit = mcqsToDisplay[editingMcqIndex];
    return (
      <div className="space-y-4">
        <QuestionEditor
          key={mcqToEdit.id}
          mode="edit"
          initialData={mcqToEdit}
          onSave={handleEditorSave}
          onCancel={() => setEditingMcqIndex(null)}
          darkMode={darkMode}
          questionNumber={editingMcqIndex + 1}
          totalQuestions={mcqsToDisplay.length}
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
