"use client";

import { useState } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";

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

  const handleCreate = () => {
    if (subjectName.trim()) {
      createSubject(subjectName.trim());
      setSubjectName("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`${
          darkMode ? "bg-slate-800" : "bg-white"
        } rounded-lg shadow-xl p-6 max-w-sm w-full`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Create New Subject
        </h2>
        <input
          autoFocus
          type="text"
          placeholder="Subject name (e.g., Biology, Chemistry)"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape") onClose();
          }}
          className={`w-full px-4 py-2 rounded-lg mb-4 ${
            darkMode
              ? "bg-slate-700 text-white border-slate-600"
              : "bg-white border border-gray-300 text-gray-900"
          }`}
        />
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className={darkMode ? "bg-slate-700 text-slate-100" : ""}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
