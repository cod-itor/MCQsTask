"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MCQ } from "@/lib/types";

interface MCQJSONEditorProps {
  mcqs: MCQ[];
  onChange: (mcqs: MCQ[]) => void;
  darkMode: boolean;
}

export function MCQJSONEditor({
  mcqs,
  onChange,
  darkMode,
}: MCQJSONEditorProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(mcqs, null, 2));
  const [error, setError] = useState("");

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    setError("");

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        // Basic validation
        const validMcqs = parsed.filter(
          (item: any) =>
            item.q &&
            item.opts &&
            Array.isArray(item.opts) &&
            typeof item.answer === "number"
        );
        if (validMcqs.length === parsed.length) {
          onChange(parsed);
        }
      }
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
      <CardHeader>
        <CardTitle>Raw JSON Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Advanced: Edit MCQs directly as JSON. Changes sync automatically to
          the guided editor.
        </p>
        <textarea
          value={jsonText}
          onChange={handleJsonChange}
          placeholder="Edit JSON here..."
          className={`w-full h-96 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            darkMode
              ? "bg-slate-900 border-slate-600 text-slate-100"
              : "border-gray-300"
          } ${error ? "border-red-500 focus:ring-red-500" : ""}`}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
