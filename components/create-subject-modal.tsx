"use client";

import { useState } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CreateSubjectModalProps {
  onClose: () => void;
  darkMode: boolean;
}

export default function CreateSubjectModal({
  onClose,
  darkMode,
}: CreateSubjectModalProps) {
  const { createSubject } = useSubjects();
  const [subjectName, setSubjectName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!subjectName.trim()) {
      setError("Subject name is required");
      return;
    }

    if (subjectName.trim().length < 2) {
      setError("Subject name must be at least 2 characters");
      return;
    }

    createSubject(subjectName.trim());
    setSubjectName("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        } rounded-xl shadow-2xl w-full max-w-md border`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-start justify-between p-6 pb-4 border-b ${
            darkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <div className="pr-2">
            <h2
              className={`text-2xl font-bold ${
                darkMode ? "text-slate-100" : "text-gray-900"
              }`}
            >
              Create New Subject
            </h2>
            <p
              className={`text-sm mt-1 ${
                darkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              Add a new subject to organize your questions
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`h-8 w-8 p-0 rounded-full ${
              darkMode
                ? "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="subject-name"
              className={`block text-sm font-semibold ${
                darkMode ? "text-slate-200" : "text-gray-700"
              }`}
            >
              Subject Name
            </label>
            <input
              id="subject-name"
              autoFocus
              type="text"
              placeholder="e.g., Biology, Chemistry, Physics"
              value={subjectName}
              onChange={(e) => {
                setSubjectName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              className={`w-full px-4 py-3 rounded-lg text-base transition-all ${
                darkMode
                  ? "bg-slate-900 text-slate-100 border border-slate-600 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              } ${
                error ? (darkMode ? "border-red-500" : "border-red-500") : ""
              }`}
            />
            {error && (
              <p
                className={`text-sm font-medium ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}
          </div>

          {/* Tip box */}
          <div
            className={`p-3 rounded-lg text-sm ${
              darkMode
                ? "bg-blue-900/20 text-blue-300"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            <p className="font-medium mb-1">💡 Tip</p>
            <p>
              Press{" "}
              <kbd
                className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                  darkMode ? "bg-slate-700" : "bg-white"
                }`}
              >
                Enter
              </kbd>{" "}
              to create or{" "}
              <kbd
                className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                  darkMode ? "bg-slate-700" : "bg-white"
                }`}
              >
                Esc
              </kbd>{" "}
              to cancel
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex gap-3 p-6 pt-4 border-t ${
            darkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className={`flex-1 h-11 text-base font-semibold ${
              darkMode
                ? "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!subjectName.trim()}
            className="flex-1 h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Create Subject
          </Button>
        </div>
      </div>
    </div>
  );
}
