"use client";
import { Button } from "@/components/ui/button";
import { useSubjects } from "@/lib/subject-context";
import { Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";
import CreateSubjectModal from "./create-subject-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMobileSidebar?: () => void;
}

export default function Navbar({
  darkMode,
  onToggleDarkMode,
  onOpenMobileSidebar,
}: NavbarProps) {
  const { subjects } = useSubjects();
  const hasSubjects = subjects.length > 0;
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateClick = () => {
    console.log(" Create subject button clicked");
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    console.log(" Closing modal");
    setShowCreateModal(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-16 border-b z-40 ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: App Name */}
          <button
            onClick={() => (window.location.href = "/")}
            className={`font-semibold text-lg ${
              darkMode ? "text-white" : "text-gray-900"
            } hover:opacity-80 transition-opacity`}
          >
            DITOR
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDarkMode}
              className="rounded-lg"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Subjects Menu - Only visible on desktop when subjects exist */}
            {hasSubjects && (
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      Subjects
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCreateClick}>
                      + New Subject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenMobileSidebar}
              className="md:hidden rounded-lg"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {showCreateModal && (
        <CreateSubjectModal onClose={handleCloseModal} darkMode={darkMode} />
      )}
    </>
  );
}
