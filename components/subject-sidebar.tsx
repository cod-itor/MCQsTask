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
    console.log(" Create subject button clicked");
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    console.log(" Closing modal");
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
            ? "bg-slate-900 border-slate-700/50"
            : "bg-gradient-to-b from-white to-gray-50 border-gray-200"
        } border-r transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Header with Gradient */}
        <div
          className={`p-5 border-b relative overflow-hidden ${
            darkMode ? "border-slate-700/50" : "border-gray-200"
          }`}
        >
          {/* Background decoration */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 ${
              darkMode ? "bg-blue-500" : "bg-blue-300"
            }`}
          ></div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  darkMode ? "bg-blue-500" : "bg-blue-600"
                } animate-pulse`}
              ></div>
              <h2
                className={`font-bold text-lg tracking-tight ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                My Subjects
              </h2>
            </div>
            <Button
              onClick={handleCreateClick}
              className={`w-full font-semibold text-sm py-5 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                darkMode
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              }`}
            >
              <span className="text-lg mr-2">+</span> New Subject
            </Button>
          </div>
        </div>

        {/* Subjects List */}
        <div
          className={`flex-1 overflow-y-auto ${
            darkMode ? "bg-slate-900" : "bg-white"
          }`}
        >
          {subjects.length === 0 ? (
            <div className="p-6 text-center">
              <div className="mb-4 text-4xl">📚</div>
              <p
                className={`text-sm leading-relaxed ${
                  darkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                No subjects yet.
                <br />
                <span className="font-semibold">
                  Create one to get started!
                </span>
              </p>
            </div>
          ) : (
            <div className="p-3">
              {/* Favorite Subjects */}
              {favorites.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 px-2 mb-3">
                    <span className="text-yellow-500">⭐</span>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      Favorites
                    </p>
                  </div>
                  <div className="space-y-2">
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
                    <div className="flex items-center gap-2 px-2 mb-3">
                      <span className="text-gray-400">📁</span>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          darkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        All Subjects
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
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

        {/* Footer Stats */}
        {subjects.length > 0 && (
          <div
            className={`p-4 border-t ${
              darkMode
                ? "bg-slate-800/50 border-slate-700/50"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-semibold ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                Total Subjects
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-bold ${
                  darkMode
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {subjects.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateSubjectModal onClose={handleCloseModal} darkMode={darkMode} />
      )}
    </>
  );
}
