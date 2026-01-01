"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import { convertInternalIndexToUser } from "@/lib/mcq-validation";
import type { MCQ } from "@/lib/types";

interface AddManualQuestionProps {
  onAdd: (mcq: MCQ) => void;
  onClose: () => void;
  darkMode: boolean;
}

export function AddManualQuestion({
  onAdd,
  onClose,
  darkMode,
}: AddManualQuestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1);
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

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

    const newMcq: MCQ = {
      id: `mcq-${Date.now()}-${Math.random()}`,
      q: question,
      opts: options,
      answer: correctAnswer,
      explanation: explanation || undefined,
    };

    onAdd(newMcq);

    // Reset form
    setQuestion("");
    setOptions(["", "", ""]);
    setCorrectAnswer(0);
    setExplanation("");
    setIsOpen(false);
  };

  return (
    <Card
      className={`mb-6 border-green-500 ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-green-50"
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-600">Add New Question</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
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
                  className="text-red-500"
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
            className="mt-2 w-full bg-transparent"
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
          <div className="flex gap-2 items-center flex-wrap">
            {options.map((_, index) => (
              <Button
                key={index}
                variant={correctAnswer === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCorrectAnswer(index)}
                className={
                  correctAnswer === index
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                Option {convertInternalIndexToUser(index)}
              </Button>
            ))}
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
          <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-100">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Add Question
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className={darkMode ? "bg-slate-700 border-slate-600" : ""}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
