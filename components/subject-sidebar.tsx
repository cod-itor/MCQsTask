"use client";

import { useState, useEffect } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import SubjectItem from "./subject-item";
import CreateSubjectModal from "./create-subject-modal";

interface SubjectSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  darkMode: boolean;
  onCreateSubjectClick?: () => void;
}

export default function SubjectSidebar({
  isOpen = true,
  onClose,
  darkMode,
  onCreateSubjectClick,
}: SubjectSidebarProps) {
  const { subjects, activeSubjectId, setActiveSubject } = useSubjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Separate favorites and non-favorites
  const favorites = subjects
    .filter((s) => s.isFavorite)
    .sort((a, b) => a.name.localeCompare(b.name));
  const others = subjects
    .filter((s) => !s.isFavorite)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleCreateClick = () => {
    console.log("[v0] Create subject button clicked");
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    console.log("[v0] Closing modal");
    setShowCreateModal(false);
  };

  // Expose the create function to parent component
  useEffect(() => {
    if (onCreateSubjectClick) {
      // Make the function accessible globally so parent can trigger it
      (window as any).openCreateSubjectModal = handleCreateClick;
    }

    return () => {
      // Cleanup when component unmounts
      if ((window as any).openCreateSubjectModal) {
        delete (window as any).openCreateSubjectModal;
      }
    };
  }, [onCreateSubjectClick]);

  return (
    <>
      <div
        className={`h-full ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        } border-r transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${
            darkMode ? "border-slate-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`font-semibold mb-3 ${
              darkMode ? "text-slate-100" : "text-gray-900"
            }`}
          >
            Subjects
          </h2>
          <Button
            onClick={handleCreateClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            + New Subject
          </Button>
        </div>

        {/* Subjects List */}
        <div className="flex-1 overflow-y-auto">
          {subjects.length === 0 ? (
            <div
              className={`p-4 text-center text-sm ${
                darkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              No subjects yet. Create one to get started.
            </div>
          ) : (
            <div className="p-2">
              {/* Favorite Subjects */}
              {favorites.length > 0 && (
                <div className="mb-2">
                  <p
                    className={`text-xs font-semibold uppercase mb-2 ${
                      darkMode ? "text-slate-500" : "text-gray-400"
                    }`}
                  >
                    Favorites
                  </p>
                  <div className="space-y-1">
                    {favorites.map((subject) => (
                      <SubjectItem
                        key={subject.id}
                        subject={subject}
                        isActive={activeSubjectId === subject.id}
                        onClick={() => setActiveSubject(subject.id)}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Subjects */}
              {others.length > 0 && (
                <div>
                  {favorites.length > 0 && (
                    <p
                      className={`text-xs font-semibold uppercase mb-2 ${
                        darkMode ? "text-slate-500" : "text-gray-400"
                      }`}
                    >
                      All Subjects
                    </p>
                  )}
                  <div className="space-y-1">
                    {others.map((subject) => (
                      <SubjectItem
                        key={subject.id}
                        subject={subject}
                        isActive={activeSubjectId === subject.id}
                        onClick={() => setActiveSubject(subject.id)}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateSubjectModal onClose={handleCloseModal} darkMode={darkMode} />
      )}
    </>
  );
}
