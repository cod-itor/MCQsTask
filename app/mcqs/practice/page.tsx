"use client";

import { useEffect, useState } from "react";
import PracticeTest from "@/components/pages/practice-test";
import SubjectSidebar from "@/components/subject-sidebar";
import { useRouter } from "next/navigation";

export default function PracticePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleOpenMobileSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar - only show on mobile when open */}
      <div
        className={`fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 z-50 md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SubjectSidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          darkMode={darkMode}
        />
      </div>

      {/* Main Content */}
      <PracticeTest
        onBack={handleBack}
        darkMode={darkMode}
        onOpenMobileSidebar={handleOpenMobileSidebar}
      />
    </>
  );
}
