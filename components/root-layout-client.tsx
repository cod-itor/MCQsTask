"use client";

import type React from "react";

import { useState } from "react";
import Navbar from "@/components/navbar";
import SubjectSidebar from "@/components/subject-sidebar";
import MobileSidebarDrawer from "@/components/mobile-sidebar-drawer";
import CreateSubjectModal from "@/components/create-subject-modal";
import { usePathname } from "next/navigation";
import { useDarkMode } from "@/lib/dark-mode-context";
import { ChevronLeft } from "lucide-react";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);


  const handleCreateSubject = () => {
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(false);
    }
    setShowCreateModal(true);
  };

  if (typeof window !== "undefined") {
    (window as any).openMobileSidebar = () => setMobileDrawerOpen(true);
  }

  const showSidebar = pathname === "/mcqs";
  const gapFixPage =
    pathname === "/" ||
    pathname === "/home" ||
    pathname === "/about" ||
    pathname === "/mcqs";

  const getCurrentPage = (): "home" | "mcqs" | "about" => {
    if (pathname.startsWith("/mcqs")) return "mcqs";
    if (pathname === "/about") return "about";
    return "home";
  };

  return (
    <>
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
        onCreateSubject={handleCreateSubject}
        currentPage={getCurrentPage()}
      />

      <main className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div
          className={`min-h-screen transition-colors duration-300 ${
            darkMode ? "bg-gray-950" : "bg-gray-50"
          }`}
        >
          <div
            className={`flex min-h-[calc(100vh-80px)] ${
              gapFixPage ? "" : "pt-20"
            } relative`}
          >
            {/* Dummy spacer to push content */}
            {showSidebar && (
              <div 
                className={`hidden md:block transition-[width] duration-300 ease-in-out shrink-0 ${
                  !desktopSidebarOpen ? "w-0" : "w-64"
                }`} 
              />
            )}

            {/* Actual sliding Desktop Sidebar */}
            {showSidebar && (
              <div
                className={`hidden md:block fixed z-40 top-20 bottom-0 transition-transform duration-300 ease-in-out ${
                  !desktopSidebarOpen ? "-translate-x-full" : "translate-x-0"
                } w-64`}
              >
                <div className="w-64 h-full shadow-sm relative group border-r border-gray-200 dark:border-slate-700/50">
                  <SubjectSidebar
                    darkMode={darkMode}
                    onCreateSubjectClick={handleCreateSubject}
                  />
                  
                  {/* Floating Toggle Button */}
                  <button
                    onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
                    className={`absolute top-10 -right-3.5 z-50 flex items-center justify-center w-7 h-7 rounded-lg border shadow-sm transition-all duration-300 ${
                      darkMode 
                        ? "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" 
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${!desktopSidebarOpen ? "translate-x-3.5" : ""}`}
                    aria-label="Toggle Sidebar"
                  >
                    <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!desktopSidebarOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Drawer */}
            <MobileSidebarDrawer
              isOpen={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              darkMode={darkMode}
              onCreateSubject={handleCreateSubject}
            />

            {/* Main Content */}
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <CreateSubjectModal
          onClose={() => setShowCreateModal(false)}
          darkMode={darkMode}
        />
      )}
    </>
  );
}
