"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import type { ReadingPassage } from "@/lib/types";

interface SearchReadingProps {
  passages: ReadingPassage[];
  onFilterChange: (filtered: ReadingPassage[]) => void;
  darkMode: boolean;
}

export function SearchReading({
  passages,
  onFilterChange,
  darkMode,
}: SearchReadingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInContent, setSearchInContent] = useState(true);
  const [searchInQuestions, setSearchInQuestions] = useState(true);

  useEffect(() => {
    if (!searchQuery.trim()) {
      onFilterChange(passages);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = passages.filter((passage) => {
      const matchesContent =
        searchInContent && (passage.header.toLowerCase().includes(lowerQuery) || passage.content.toLowerCase().includes(lowerQuery));
      const matchesQuestions =
        searchInQuestions &&
        passage.questions.some((q) => q.text.toLowerCase().includes(lowerQuery) || q.options.some((opt) => opt.toLowerCase().includes(lowerQuery)));
      return matchesContent || matchesQuestions;
    });
    onFilterChange(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passages]);

  const handleSearch = (query: string, content: boolean, questions: boolean) => {
    setSearchQuery(query);

    if (!query.trim()) {
      onFilterChange(passages);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = passages.filter((passage) => {
      const matchesContent =
        content && (passage.header.toLowerCase().includes(lowerQuery) || passage.content.toLowerCase().includes(lowerQuery));
      const matchesQuestions =
        questions &&
        passage.questions.some((q) => q.text.toLowerCase().includes(lowerQuery) || q.options.some((opt) => opt.toLowerCase().includes(lowerQuery)));

      return matchesContent || matchesQuestions;
    });

    onFilterChange(filtered);
  };

  const handleClear = () => {
    setSearchQuery("");
    onFilterChange(passages);
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
            placeholder="Search passages and questions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value, searchInContent, searchInQuestions)}
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

      {/* Search toggles */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button
          variant={searchInContent ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const next = !searchInContent;
            setSearchInContent(next);
            handleSearch(searchQuery, next, searchInQuestions);
          }}
          className={searchInContent ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
        >
          Passage Content
        </Button>
        <Button
          variant={searchInQuestions ? "default" : "outline"}
          size="sm"
          onClick={() => {
            const next = !searchInQuestions;
            setSearchInQuestions(next);
            handleSearch(searchQuery, searchInContent, next);
          }}
          className={searchInQuestions ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
        >
          Questions
        </Button>
      </div>

      {searchQuery && (
        <div className="mt-3">
          <Badge variant="outline">
            {passages.length > 0
              ? `${Math.max(
                  0,
                  passages.length - (passages.length - Math.min(passages.length, 999))
                )} of ${passages.length} shown`
              : "0 results"}
          </Badge>
        </div>
      )}
    </div>
  );
}
