"use client";

import { Badge } from "@/components/ui/badge";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReadingPassageEditor } from "./reading-passage-editor";
import { X } from "lucide-react";
import type { ReadingPassage } from "@/lib/types";

interface ReadingStructuredEditorProps {
  passages: ReadingPassage[];
  onChange: (passages: ReadingPassage[]) => void;
  darkMode: boolean;
}

export function ReadingStructuredEditor({
  passages,
  onChange,
  darkMode,
}: ReadingStructuredEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleEditorSave = useCallback(
    (updatedPassage: ReadingPassage) => {
      if (editingIndex === null) return;

      const updated = [...passages];
      updated[editingIndex] = updatedPassage;
      onChange(updated);
      setEditingIndex(null);
    },
    [editingIndex, passages, onChange]
  );

  const removePassage = useCallback(
    (index: number) => {
      const updated = passages.filter((_, i) => i !== index);
      onChange(updated);
      if (expandedIndex === index) {
        setExpandedIndex(null);
      }
    },
    [passages, onChange, expandedIndex]
  );

  const handleNext = useCallback(() => {
    if (editingIndex !== null && editingIndex < passages.length - 1) {
      const newIndex = editingIndex + 1;
      setEditingIndex(newIndex);
      setExpandedIndex(newIndex);
    }
  }, [editingIndex, passages.length]);

  const handlePrevious = useCallback(() => {
    if (editingIndex !== null && editingIndex > 0) {
      const newIndex = editingIndex - 1;
      setEditingIndex(newIndex);
      setExpandedIndex(newIndex);
    }
  }, [editingIndex]);

  const handleJumpTo = useCallback(
    (passageNumber: number) => {
      const newIndex = passageNumber - 1;
      if (newIndex >= 0 && newIndex < passages.length) {
        setEditingIndex(null);
        setExpandedIndex(null);
        setTimeout(() => {
          setEditingIndex(newIndex);
          setExpandedIndex(newIndex);
        }, 0);
      }
    },
    [passages.length]
  );

  if (editingIndex !== null && expandedIndex === editingIndex) {
    const passageToEdit = passages[editingIndex];

    return (
      <div className="space-y-4">
        <ReadingPassageEditor
          key={`${passageToEdit.id}-${editingIndex}`}
          mode="edit"
          initialData={passageToEdit}
          onSave={handleEditorSave}
          onCancel={() => setEditingIndex(null)}
          darkMode={darkMode}
          passageNumber={editingIndex + 1}
          totalPassages={passages.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onJumpTo={handleJumpTo}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {passages.map((passage, displayIndex) => (
        <Card
          key={`passage-${passage.id || displayIndex}`}
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
                  {passage.header || "Untitled Passage"}
                </CardTitle>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {passage.questions.length} questions
                  </Badge>
                  {passage.globalOptions && passage.globalOptions.length > 0 && (
                    <Badge
                      className={`text-xs ${
                        darkMode
                          ? "bg-green-900 text-green-100"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {passage.globalOptions.length} Global Options
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedIndex(displayIndex);
                    setEditingIndex(displayIndex);
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
                    removePassage(displayIndex);
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

      {passages.length === 0 && (
        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <CardContent className="p-8 text-center text-muted-foreground">
            No passages yet. Import or create passages to begin editing.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
