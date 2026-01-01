"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, ChevronLeft, ChevronRight, Check } from "lucide-react";

// Convert index to letter (0 -> A, 1 -> B, etc.)
const indexToLetter = (index: number): string => {
  return String.fromCharCode(65 + index);
};

// Convert letter to index (A -> 0, B -> 1, etc.)
const letterToIndex = (letter: string): number => {
  return letter.toUpperCase().charCodeAt(0) - 65;
};

interface MCQ {
  id: string;
  q: string;
  opts: string[];
  answer: number;
  explanation?: string;
}

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
  onJumpTo?: (questionNumber: number) => void;
}

interface QuestionNavigatorProps {
  questionNumber: number;
  totalQuestions: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onJumpTo: (questionNumber: number) => void;
  darkMode: boolean;
}

function QuestionNavigator({
  questionNumber,
  totalQuestions,
  onPrevious,
  onNext,
  onJumpTo,
  darkMode,
}: QuestionNavigatorProps) {
  const [inputValue, setInputValue] = useState(questionNumber.toString());
  const [error, setError] = useState("");

  useEffect(() => {
    setInputValue(questionNumber.toString());
    setError("");
  }, [questionNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
      setError("");
    }
  };

  const handleInputBlur = () => {
    if (inputValue === "") {
      setInputValue(questionNumber.toString());
      return;
    }

    const num = parseInt(inputValue, 10);

    console.log("=== Input Blur Debug ===");
    console.log("Input value:", inputValue);
    console.log("Parsed number:", num);
    console.log("Current question number:", questionNumber);
    console.log("Total questions:", totalQuestions);

    if (isNaN(num) || num < 1) {
      setError("Minimum is 1");
      setInputValue(questionNumber.toString());
      setTimeout(() => setError(""), 2000);
      return;
    }

    if (num > totalQuestions) {
      setError(`Maximum is ${totalQuestions}`);
      setInputValue(questionNumber.toString());
      setTimeout(() => setError(""), 2000);
      return;
    }

    if (num !== questionNumber) {
      console.log("Calling onJumpTo with:", num);
      onJumpTo(num);
    } else {
      console.log("Number matches current question, no jump needed");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!onPrevious || questionNumber === 1}
          className={`h-9 w-9 p-0 ${
            darkMode
              ? "bg-slate-700 border-slate-600 hover:bg-slate-600 disabled:opacity-50"
              : "disabled:opacity-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={`h-9 w-16 text-center text-sm font-medium ${
              darkMode
                ? "bg-slate-700 border-slate-600 text-slate-200"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              darkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            / {totalQuestions}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!onNext || questionNumber === totalQuestions}
          className={`h-9 w-9 p-0 ${
            darkMode
              ? "bg-slate-700 border-slate-600 hover:bg-slate-600 disabled:opacity-50"
              : "disabled:opacity-50"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <div
          className={`text-xs font-medium px-3 py-1 rounded ${
            darkMode ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-600"
          }`}
        >
          {error}
        </div>
      )}
    </div>
  );
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
  onJumpTo,
}: QuestionEditorProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("=== QuestionEditor useEffect ===");
    console.log("Mode:", mode);
    console.log("Question Number:", questionNumber);
    console.log("Initial Data ID:", initialData?.id);
    console.log("Initial Data Question:", initialData?.q?.substring(0, 50));

    if (mode === "edit" && initialData) {
      setQuestion(initialData.q);
      setOptions([...initialData.opts]);
      setCorrectAnswer(initialData.answer);
      setExplanation(initialData.explanation || "");
    } else {
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
      setExplanation("");
    }
    setError("");
  }, [mode, initialData, questionNumber]);

  const handleAddOption = useCallback(() => {
    if (options.length < 26) {
      setOptions((prev) => [...prev, ""]);
    }
  }, [options.length]);

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
      className={`${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white"
      } max-w-4xl mx-auto`}
    >
      <CardHeader className="pb-6 space-y-0">
        {/* Top Row: Title and Close Button */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <CardTitle
            className={`text-xl font-semibold leading-tight ${
              mode === "add" ? "text-green-600" : "text-blue-600"
            } flex-1 min-w-0`}
          >
            {headerTitle}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className={`h-9 w-9 p-0 flex-shrink-0 ${
              darkMode
                ? "text-slate-300 hover:bg-slate-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Bottom Row: Navigation - Only shown when needed */}
        {questionNumber &&
          totalQuestions &&
          (totalQuestions > 1 || mode === "edit") && (
            <QuestionNavigator
              questionNumber={questionNumber}
              totalQuestions={totalQuestions}
              onPrevious={onPrevious}
              onNext={onNext}
              onJumpTo={onJumpTo || (() => {})}
              darkMode={darkMode}
            />
          )}
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Question */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${
              darkMode ? "text-slate-200" : "text-gray-700"
            }`}
          >
            Question
          </label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here..."
            className={`resize-none min-h-[100px] text-base ${
              darkMode
                ? "bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                : "border-gray-300"
            }`}
            rows={4}
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${
              darkMode ? "text-slate-200" : "text-gray-700"
            }`}
          >
            Answer Options
          </label>
          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-3 items-start group">
                {/* Letter Badge */}
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(index)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0 transition-all duration-200 ${
                    correctAnswer === index
                      ? darkMode
                        ? "bg-green-600 text-white ring-2 ring-green-400 ring-offset-2 ring-offset-slate-800"
                        : "bg-green-500 text-white ring-2 ring-green-400 ring-offset-2"
                      : darkMode
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                  }`}
                  title={`Click to set as correct answer`}
                >
                  {correctAnswer === index ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    indexToLetter(index)
                  )}
                </button>

                {/* Option Input */}
                <div className="flex-1">
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${indexToLetter(index)}`}
                    className={`text-base h-10 ${
                      darkMode
                        ? "bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                        : "border-gray-300"
                    } ${
                      correctAnswer === index
                        ? darkMode
                          ? "border-green-600"
                          : "border-green-500"
                        : ""
                    }`}
                  />
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 2}
                  className={`h-10 w-10 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    options.length <= 2 ? "!opacity-50" : ""
                  } ${
                    darkMode
                      ? "text-red-400 hover:bg-red-900/30 hover:text-red-300"
                      : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Option Button */}
          {options.length < 26 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className={`w-full h-10 mt-2 ${
                darkMode
                  ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option (Next: {indexToLetter(options.length)})
            </Button>
          )}
        </div>

        {/* Correct Answer Display */}
        <div
          className={`p-4 rounded-lg ${
            darkMode
              ? "bg-green-900/20 border border-green-800"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base ${
                darkMode ? "bg-green-600 text-white" : "bg-green-500 text-white"
              }`}
            >
              {indexToLetter(correctAnswer)}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  darkMode ? "text-green-400" : "text-green-700"
                }`}
              >
                Correct Answer
              </p>
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-300" : "text-gray-600"
                }`}
              >
                Click on any option letter to set it as the correct answer
              </p>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-3">
          <label
            className={`block text-sm font-semibold ${
              darkMode ? "text-slate-200" : "text-gray-700"
            }`}
          >
            Explanation{" "}
            <span className="text-sm font-normal text-gray-500">
              (Optional)
            </span>
          </label>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Provide an explanation for why this is the correct answer..."
            className={`resize-none min-h-[80px] text-base ${
              darkMode
                ? "bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
                : "border-gray-300"
            }`}
            rows={3}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`p-4 rounded-lg text-sm font-medium ${
              darkMode
                ? "bg-red-900/30 border border-red-800 text-red-300"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <Button
            onClick={handleSubmit}
            className={`flex-1 h-11 text-base font-semibold ${
              mode === "add"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white shadow-lg`}
          >
            {buttonLabel}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className={`flex-1 h-11 text-base font-semibold ${
              darkMode
                ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
