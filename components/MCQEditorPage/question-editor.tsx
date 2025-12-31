"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  convertInternalIndexToUser,
  convertUserIndexToInternal,
} from "@/lib/mcq-validation";
import type { MCQ } from "@/lib/types";

interface QuestionEditorProps {
  mode: "add" | "edit";
  initialData?: MCQ;
  onSave: (mcq: MCQ) => void;
  onCancel: () => void;
  darkMode: boolean;
  questionNumber?: number;
  totalQuestions?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function QuestionEditor({
  mode,
  initialData,
  onSave,
  onCancel,
  darkMode,
  questionNumber,
  totalQuestions,
  onNext,
  onPrevious,
}: QuestionEditorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");
  const [editingAnswerIndex, setEditingAnswerIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setQuestion(initialData.q);
      setOptions([...initialData.opts]);
      setCorrectAnswer(initialData.answer);
      setExplanation(initialData.explanation || "");
    } else {
      setQuestion("");
      setOptions(["", "", ""]);
      setCorrectAnswer(0);
      setExplanation("");
    }
    setError("");
    setEditingAnswerIndex(null);
  }, [mode, initialData]);

  const handleAddOption = useCallback(() => {
    setOptions((prev) => [...prev, ""]);
  }, []);

  const handleRemoveOption = useCallback((index: number) => {
    setOptions((prev) => {
      if (prev.length <= 2) return prev;
      const newOptions = prev.filter((_, i) => i !== index);
      setCorrectAnswer((curr) =>
        curr >= newOptions.length ? newOptions.length - 1 : curr
      );
      return newOptions;
    });
  }, []);

  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  }, []);

  const handleAnswerInput = useCallback(
    (userInput: string) => {
      const num = Number.parseInt(userInput);
      if (!isNaN(num)) {
        const internalIndex = convertUserIndexToInternal(num);
        if (internalIndex >= 0 && internalIndex < options.length) {
          setCorrectAnswer(internalIndex);
          setEditingAnswerIndex(null);
        }
      }
    },
    [options.length]
  );

  const handleSubmit = () => {
    setError("");

    if (!question.trim()) {
      setError("Question is required");
      return;
    }

    if (options.some((opt) => !opt.trim())) {
      setError("All options must be filled");
      return;
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      setError("Please select a valid correct answer");
      return;
    }

    const mcq: MCQ = {
      id: initialData?.id || `mcq-${Date.now()}-${Math.random()}`,
      q: question,
      opts: options,
      answer: correctAnswer,
      explanation: explanation || undefined,
    };

    onSave(mcq);
  };

  const buttonLabel = mode === "add" ? "Add Question" : "Apply Changes";
  const headerTitle =
    mode === "add"
      ? "Add New Question"
      : `Editing Question ${questionNumber || ""}`;

  return (
    <Card
      className={`${darkMode ? "bg-slate-800 border-slate-700" : "bg-white"}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className={mode === "add" ? "text-green-600" : "text-blue-600"}
        >
          {headerTitle}
        </CardTitle>
        {questionNumber &&
          totalQuestions &&
          (totalQuestions > 1 || mode === "edit") && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!onPrevious || questionNumber === 1}
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span
                className={`text-sm px-3 py-2 rounded ${
                  darkMode ? "bg-slate-700" : "bg-gray-100"
                }`}
              >
                {questionNumber} / {totalQuestions}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!onNext || questionNumber === totalQuestions}
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className={`${
            darkMode ? "text-slate-300 hover:bg-slate-700" : "text-gray-500"
          }`}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium mb-2">Question</label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question..."
            className={`resize-none ${
              darkMode ? "bg-slate-900 border-slate-600" : ""
            }`}
            rows={3}
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Options (Display index 1-{options.length})
          </label>
          <div className="space-y-2">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {convertInternalIndexToUser(index)}
                </div>
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${convertInternalIndexToUser(index)}`}
                  className={darkMode ? "bg-slate-900 border-slate-600" : ""}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 2}
                  className={`text-red-500 flex-shrink-0 ${
                    darkMode ? "hover:bg-slate-700" : ""
                  }`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className={`mt-2 w-full ${
              darkMode ? "bg-slate-700 border-slate-600 hover:bg-slate-600" : ""
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Correct Answer
          </label>
          <div className="flex gap-2 items-center">
            <p className="text-sm text-muted-foreground">
              Currently set to option:{" "}
              <strong>{convertInternalIndexToUser(correctAnswer)}</strong>
            </p>
            {editingAnswerIndex === null ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingAnswerIndex(0)}
                className={darkMode ? "bg-slate-700 border-slate-600" : ""}
              >
                Change
              </Button>
            ) : (
              <div className="flex gap-2 flex-1">
                <Input
                  type="number"
                  min={1}
                  max={options.length}
                  placeholder="Enter option number (1-based)"
                  className={`w-24 ${
                    darkMode ? "bg-slate-900 border-slate-600" : ""
                  }`}
                  autoFocus
                  onBlur={() => setEditingAnswerIndex(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAnswerInput(e.currentTarget.value);
                    } else if (e.key === "Escape") {
                      setEditingAnswerIndex(null);
                    }
                  }}
                  onChange={(e) => handleAnswerInput(e.currentTarget.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Explanation (Optional)
          </label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Add explanation for the correct answer..."
            className={`resize-none ${
              darkMode ? "bg-slate-900 border-slate-600" : ""
            }`}
            rows={2}
          />
        </div>

        {error && (
          <div
            className={`p-3 rounded-lg text-sm border ${
              darkMode
                ? "bg-red-900 border-red-700 text-red-100"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 sticky bottom-0 to-transparent md:from-transparent -mx-6 px-6 pb-4 md:pb-0 md:mx-0 md:px-0">
          <Button
            onClick={handleSubmit}
            className={`flex-1 ${
              mode === "add"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {buttonLabel}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className={`flex-1 ${
              darkMode ? "bg-slate-700 border-slate-600" : ""
            }`}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
