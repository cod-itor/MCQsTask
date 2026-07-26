"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import type { ListeningQuestion } from "@/lib/types";

interface SearchListeningProps {
  questions: ListeningQuestion[];
  onFilterChange: (filtered: ListeningQuestion[]) => void;
  darkMode: boolean;
}

export function SearchListening({
  questions,
  onFilterChange,
  darkMode,
}: SearchListeningProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInWord, setSearchInWord] = useState(true);
  const [searchInAnswer, setSearchInAnswer] = useState(true);

  useEffect(() => {
    if (!searchQuery.trim()) {
      onFilterChange(questions);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = questions.filter((q) => {
      const matchesWord = searchInWord && q.q.toLowerCase().includes(lowerQuery);
      const matchesAnswer = searchInAnswer && q.a?.toLowerCase().includes(lowerQuery);
      return matchesWord || matchesAnswer;
    });
    onFilterChange(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const handleSearch = (query: string, word: boolean, answer: boolean) => {
    setSearchQuery(query);

    if (!query.trim()) {
      onFilterChange(questions);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = questions.filter((q) => {
      const matchesWord = word && q.q.toLowerCase().includes(lowerQuery);
      const matchesAnswer = answer && q.a?.toLowerCase().includes(lowerQuery);
      return matchesWord || matchesAnswer;
    });

    onFilterChange(filtered);
  };

  const handleClear = () => {
    setSearchQuery("");
    onFilterChange(questions);
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex gap-2 flex-col md:flex-row md:items-center mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search words and translations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value, searchInWord, searchInAnswer)}
            className={`pl-10 ${
              darkMode ? "bg-slate-900 border-slate-600" : ""
            }`}
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        <Button
          variant={searchInWord ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const next = !searchInWord;
            setSearchInWord(next);
            handleSearch(searchQuery, next, searchInAnswer);
          }}
          className={searchInWord ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
        >
          Word
        </Button>
        <Button
          variant={searchInAnswer ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const next = !searchInAnswer;
            setSearchInAnswer(next);
            handleSearch(searchQuery, searchInWord, next);
          }}
          className={searchInAnswer ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
        >
          Translation
        </Button>
      </div>

      {searchQuery && (
        <div className="mt-3">
          <Badge variant="outline">
            {questions.length > 0
              ? `${Math.max(0, questions.length - (questions.length - Math.min(questions.length, 999)))} of ${questions.length} shown`
              : "0 results"}
          </Badge>
        </div>
      )}
    </div>
  );
}
