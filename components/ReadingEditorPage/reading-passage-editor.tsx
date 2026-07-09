"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, ChevronLeft, ChevronRight, Check, Trash } from "lucide-react";
import type { ReadingPassage, ReadingQuestion } from "@/lib/types";

interface ReadingPassageEditorProps {
  mode: "add" | "edit";
  initialData?: ReadingPassage;
  onSave: (passage: ReadingPassage) => void;
  onCancel: () => void;
  darkMode: boolean;
  passageNumber?: number;
  totalPassages?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onJumpTo?: (passageNumber: number) => void;
}

const generateUniqueId = () => crypto.randomUUID();

export function ReadingPassageEditor({
  mode,
  initialData,
  onSave,
  onCancel,
  darkMode,
  passageNumber,
  totalPassages,
  onNext,
  onPrevious,
  onJumpTo,
}: ReadingPassageEditorProps) {
  const [header, setHeader] = useState("");
  const [content, setContent] = useState("");
  const [globalOptionsStr, setGlobalOptionsStr] = useState("");
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setHeader(initialData.header);
      setContent(initialData.content);
      setGlobalOptionsStr(initialData.globalOptions ? initialData.globalOptions.join(", ") : "");
      setQuestions([...initialData.questions]);
    } else {
      setHeader("");
      setContent("");
      setGlobalOptionsStr("");
      setQuestions([]);
    }
    setError("");
  }, [mode, initialData, passageNumber]);

  const handleAddQuestion = useCallback(() => {
    setQuestions([
      ...questions,
      {
        id: generateUniqueId(),
        text: "Question with [blank]",
        answer: "",
        options: []
      }
    ]);
  }, [questions]);

  const handleRemoveQuestion = useCallback((index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  }, [questions]);

  const updateQuestion = (index: number, field: keyof ReadingQuestion, value: any) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const handleSubmit = () => {
    setError("");

    if (!header.trim()) {
      setError("Header is required");
      return;
    }

    if (!content.trim()) {
      setError("Content is required");
      return;
    }

    if (questions.length === 0) {
      setError("At least one question is required");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.answer.trim()) {
        setError(`Question ${i + 1} must have a correct answer`);
        return;
      }
    }

    const passage: ReadingPassage = {
      id: initialData?.id || generateUniqueId(),
      header,
      content,
      questions,
      globalOptions: globalOptionsStr.trim() ? globalOptionsStr.split(",").map(s => s.trim()).filter(Boolean) : undefined,
    };

    onSave(passage);
  };

  const buttonLabel = mode === "add" ? "Add Passage" : "Apply Changes";
  const headerTitle = mode === "add" ? "Add New Passage" : `Editing Passage ${passageNumber || ""}`;

  return (
    <Card className={`${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white"} max-w-4xl mx-auto`}>
      <CardHeader className="pb-6 space-y-0 border-b border-slate-700/50 mb-6">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className={`text-xl font-semibold leading-tight ${mode === "add" ? "text-green-600" : "text-blue-600"} flex-1 min-w-0`}>
            {headerTitle}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className={`h-9 w-9 p-0 flex-shrink-0 ${darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="space-y-3">
          <label className="block text-sm font-semibold">Header / Title</label>
          <Input
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="e.g. Reading passage one"
            className={darkMode ? "bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500" : ""}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold">Passage Content (Use [blank] if needed)</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the full text of the passage here..."
            className={`resize-y min-h-[200px] text-base ${darkMode ? "bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500" : ""}`}
            rows={8}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold">Global Options (Comma separated, optional)</label>
          <Input
            value={globalOptionsStr}
            onChange={(e) => setGlobalOptionsStr(e.target.value)}
            placeholder="e.g. A. Research, B. Findings, C. Report"
            className={darkMode ? "bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500" : ""}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
            <h3 className="text-lg font-bold">Questions</h3>
            <Button size="sm" variant="outline" onClick={handleAddQuestion} className={darkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
          
          <div className="space-y-6">
            {questions.map((q, index) => (
              <Card key={q.id} className={`${darkMode ? "bg-slate-750 border-slate-700" : "bg-gray-50 border-gray-200"}`}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Question {index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(index)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Question Text (Use [blank] for fill-in-the-blank, omit for standard MCQ)</label>
                    <Input
                      value={q.text}
                      onChange={(e) => updateQuestion(index, "text", e.target.value)}
                      placeholder="e.g. The answer is [blank]. Or a standard question."
                      className={darkMode ? "bg-slate-900 border-slate-600 text-slate-100" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Correct Answer</label>
                    <Input
                      value={q.answer}
                      onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                      placeholder="e.g. unique"
                      className={darkMode ? "bg-slate-900 border-slate-600 text-slate-100 border-green-600" : "border-green-500"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Dropdown Options (Comma separated, optional)</label>
                    <Input
                      value={q.options ? q.options.join(", ") : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateQuestion(index, "options", val.trim() ? val.split(",").map(s => s.trim()).filter(Boolean) : undefined);
                      }}
                      placeholder="e.g. temporary, contract, permanent"
                      className={darkMode ? "bg-slate-900 border-slate-600 text-slate-100" : ""}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            {questions.length === 0 && (
              <p className="text-sm text-center text-slate-400 py-4">No questions added yet.</p>
            )}
          </div>
        </div>

        {error && (
          <div className={`p-4 rounded-lg text-sm font-medium ${darkMode ? "bg-red-900/30 border border-red-800 text-red-300" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-700/50">
          <Button onClick={handleSubmit} className={`flex-1 h-11 text-base font-semibold ${mode === "add" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white shadow-lg`}>
            {buttonLabel}
          </Button>
          <Button variant="outline" onClick={onCancel} className={`flex-1 h-11 text-base font-semibold ${darkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200" : "border-gray-300 hover:bg-gray-50"}`}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
