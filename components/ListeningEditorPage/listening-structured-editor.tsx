"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ListeningQuestion } from "@/lib/types";

interface ListeningStructuredEditorProps {
  questions: ListeningQuestion[];
  onChange: (questions: ListeningQuestion[]) => void;
  displayedQuestions?: ListeningQuestion[];
  darkMode: boolean;
}

export function ListeningStructuredEditor({
  questions,
  onChange,
  displayedQuestions,
  darkMode,
}: ListeningStructuredEditorProps) {
  const handleUpdateWord = (id: string, newWord: string) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, q: newWord } : q)));
  };

  const handleUpdateAnswer = (id: string, newAnswer: string) => {
    onChange(questions.map((q) => (q.id === id ? { ...q, a: newAnswer } : q)));
  };

  const handleDeleteWord = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
  };

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const renderList = displayedQuestions || questions;

  return (
    <div className="space-y-3">
      {renderList.map((q, i) => {
        // Find actual index to show proper numbering if it's not filtered,
        // but if filtered we might just show display index + 1
        const actualIndex = questions.findIndex(orig => orig.id === q.id);
        const displayNum = actualIndex >= 0 ? actualIndex + 1 : i + 1;

        return (
          <div
            key={q.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              darkMode
                ? "bg-slate-900/50 border-slate-700"
                : "bg-white border-gray-200 shadow-sm"
            }`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${
                darkMode
                  ? "bg-slate-800 text-slate-400"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {displayNum}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <Textarea
                value={q.q}
                onChange={(e) => handleUpdateWord(q.id, e.target.value)}
                onInput={handleAutoResize}
                placeholder="Enter word or phrase"
                rows={1}
                className={`flex-1 min-h-[44px] resize-y overflow-hidden ${
                  darkMode ? "bg-slate-800 border-slate-600 text-white" : ""
                }`}
              />
              <Textarea
                value={q.a || ""}
                onChange={(e) => handleUpdateAnswer(q.id, e.target.value)}
                onInput={handleAutoResize}
                placeholder="Enter answer / translation (optional)"
                rows={1}
                className={`flex-1 min-h-[44px] resize-y overflow-hidden ${
                  darkMode ? "bg-slate-800 border-slate-600 text-white" : ""
                }`}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteWord(q.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
