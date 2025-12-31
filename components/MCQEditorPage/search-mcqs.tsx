"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import type { MCQ } from "@/lib/types";

interface SearchMcqsProps {
  mcqs: MCQ[];
  onFilterChange: (filtered: MCQ[]) => void;
  darkMode: boolean;
}

export function SearchMcqs({
  mcqs,
  onFilterChange,
  darkMode,
}: SearchMcqsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInQuestion, setSearchInQuestion] = useState(true);
  const [searchInAnswers, setSearchInAnswers] = useState(true);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      onFilterChange(mcqs);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = mcqs.filter((mcq) => {
      const matchesQuestion =
        searchInQuestion && mcq.q.toLowerCase().includes(lowerQuery);
      const matchesAnswers =
        searchInAnswers &&
        mcq.opts.some((opt) => opt.toLowerCase().includes(lowerQuery));

      return matchesQuestion || matchesAnswers;
    });

    onFilterChange(filtered);
  };

  const handleClear = () => {
    setSearchQuery("");
    onFilterChange(mcqs);
  };

  return (
    <div
      className={`p-4 rounded-lg border ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex gap-2 flex-col md:flex-row md:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions and answers..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
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
      <div className="flex gap-2 mt-3 flex-wrap">
        <Button
          variant={searchInQuestion ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSearchInQuestion(!searchInQuestion);
            handleSearch(searchQuery);
          }}
          className={searchInQuestion ? "bg-blue-600" : ""}
        >
          Question
        </Button>
        <Button
          variant={searchInAnswers ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setSearchInAnswers(!searchInAnswers);
            handleSearch(searchQuery);
          }}
          className={searchInAnswers ? "bg-blue-600" : ""}
        >
          Answers
        </Button>
      </div>

      {searchQuery && (
        <div className="mt-3">
          <Badge variant="outline">
            {mcqs.length > 0
              ? `${Math.max(
                  0,
                  mcqs.length - (mcqs.length - Math.min(mcqs.length, 999))
                )} of ${mcqs.length} shown`
              : "0 results"}
          </Badge>
        </div>
      )}
    </div>
  );
}
