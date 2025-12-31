"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MCQ } from "@/lib/types";

interface EditMcqsModalProps {
  isOpen: boolean;
  currentMcqs: MCQ[];
  subjectName: string;
  darkMode: boolean;
  onSave: (mcqs: MCQ[]) => void;
  onClose: () => void;
}

export default function EditMcqsModal({
  isOpen,
  currentMcqs,
  subjectName,
  darkMode,
  onSave,
  onClose,
}: EditMcqsModalProps) {
  const [input, setInput] = useState(
    JSON.stringify(
      currentMcqs.map((m) => ({
        q: m.q,
        opts: m.opts,
        answer: m.answer,
        explanation: m.explanation,
      })),
      null,
      2
    )
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSave = () => {
    setError("");
    setSuccessMessage("");

    try {
      const parsed = JSON.parse(input);

      if (!Array.isArray(parsed)) {
        setError("Input must be an array of MCQs");
        return;
      }

      if (parsed.length === 0) {
        setError("Please provide at least one MCQ");
        return;
      }

      const mcqs: MCQ[] = parsed.map((item: any, index: number) => {
        const question = item.q || item.question;
        const options = item.opts || item.options;
        const correctAnswer =
          item.answer !== undefined ? item.answer : item.correctAnswer;

        if (!question || !options || correctAnswer === undefined) {
          throw new Error(
            `MCQ ${
              index + 1
            }: Missing required fields (q/question, opts/options, answer/correctAnswer)`
          );
        }
        if (!Array.isArray(options) || options.length < 2) {
          throw new Error(
            `MCQ ${index + 1}: Options must be an array with at least 2 items`
          );
        }
        if (correctAnswer < 0 || correctAnswer >= options.length) {
          throw new Error(`MCQ ${index + 1}: answer index out of range`);
        }

        return {
          id: `mcq-${Date.now()}-${Math.random()}`,
          q: question,
          opts: options,
          answer: correctAnswer,
          explanation: item.explanation || "",
        };
      });

      setSuccessMessage(`Updated ${mcqs.length} MCQ(s)`);
      setTimeout(() => {
        onSave(mcqs);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
          darkMode ? "bg-slate-800 border-slate-700" : ""
        }`}
      >
        <CardHeader
          className={`sticky top-0 ${
            darkMode
              ? "bg-slate-800 border-b border-slate-700"
              : "bg-white border-b"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Edit MCQs</CardTitle>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                Subject: {subjectName}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className={darkMode ? "bg-slate-700 border-slate-600" : ""}
            >
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON array here..."
            className={`w-full h-64 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500"
                : "border-gray-300"
            }`}
          />

          {error && (
            <div
              className={`p-3 rounded ${
                darkMode
                  ? "bg-red-900 border border-red-700 text-red-100"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              className={`p-3 rounded ${
                darkMode
                  ? "bg-green-900 border border-green-700 text-green-100"
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}
            >
              {successMessage}
            </div>
          )}

          <div className="flex gap-3 sticky bottom-0">
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!input.trim()}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className={`flex-1 ${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                  : ""
              }`}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
