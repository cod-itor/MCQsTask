"use client";

import { useState, useEffect } from "react";
import { SubjectProvider, useSubjects } from "@/lib/subject-context";
import Home from "@/components/pages/home";
import MCQInput from "@/components/pages/mcq-input";
import PracticeTest from "@/components/pages/practice-test";
import ExamSetup from "@/components/pages/exam-setup";
import ExamTest from "@/components/pages/exam-test";
import Results from "@/components/pages/results";
import SubjectSidebar from "@/components/subject-sidebar";
import MobileSidebarDrawer from "@/components/mobile-sidebar-drawer";
import type { ExamState } from "@/lib/types";

function PageContent() {
  const { activeSubjectId, getMcqsForSubject } = useSubjects();
  const [page, setPage] = useState<
    "home" | "input" | "practice" | "exam-setup" | "exam" | "results"
  >("home");
  const [examState, setExamState] = useState<ExamState | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleStartPractice = () => {
    setPage("practice");
  };

  const handleStartExamSetup = () => {
    setPage("exam-setup");
  };

  const handleStartExam = (duration: number, numQuestions: number) => {
    const allMcqs = getMcqsForSubject(activeSubjectId);
    const selectedMcqs = allMcqs
      .sort(() => Math.random() - 0.5)
      .slice(0, numQuestions);

    setExamState({
      questions: selectedMcqs,
      currentQuestion: 0,
      answers: {},
      timeRemaining: duration * 60,
      isActive: true,
      sessionId: `exam-${Date.now()}`,
      startTime: Date.now(),
      questionStartTimes: {},
    });
    setPage("exam");
  };

  const handleExamComplete = () => {
    setPage("results");
  };

  const handleCreateSubject = () => {
    console.log("handleCreateSubject called");
    console.log("Window width:", window.innerWidth);

    // Open mobile drawer first if on mobile
    if (window.innerWidth < 768) {
      console.log("Opening mobile drawer");
      setMobileDrawerOpen(true);
    }

    // Trigger the create modal after a short delay
    setTimeout(() => {
      console.log(
        "Checking for openCreateSubjectModal:",
        (window as any).openCreateSubjectModal
      );
      if ((window as any).openCreateSubjectModal) {
        console.log("Calling openCreateSubjectModal");
        (window as any).openCreateSubjectModal();
      } else {
        console.log("openCreateSubjectModal not found on window");
      }
    }, 100);
  };

  // Show sidebar on practice, exam-setup, exam, and results pages
  const showSidebar = ["practice", "exam-setup", "exam", "results"].includes(
    page
  );

  return (
    <main className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-blue-50 to-indigo-50"
        }`}
      >
        <div className="flex h-screen">
          {/* Desktop Sidebar - Always render but hide on home */}
          <div
            className={`hidden md:block w-64 border-r ${
              !showSidebar ? "md:hidden" : ""
            }`}
          >
            <SubjectSidebar
              darkMode={darkMode}
              onCreateSubjectClick={handleCreateSubject}
            />
          </div>

          {/* Mobile Drawer - Always render the component */}
          <MobileSidebarDrawer
            isOpen={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            darkMode={darkMode}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {page === "home" && (
              <Home
                onStartPractice={handleStartPractice}
                onStartExam={handleStartExamSetup}
                onInputMcqs={() => setPage("input")}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
                onCreateSubject={handleCreateSubject}
              />
            )}
            {page === "input" && (
              <MCQInput
                onMcqsLoaded={() => setPage("home")}
                darkMode={darkMode}
              />
            )}
            {page === "practice" && (
              <PracticeTest
                onBack={() => setPage("home")}
                darkMode={darkMode}
                onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
              />
            )}
            {page === "exam-setup" && (
              <ExamSetup
                onStart={handleStartExam}
                onBack={() => setPage("home")}
                darkMode={darkMode}
                onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
              />
            )}
            {page === "exam" && examState && (
              <ExamTest
                state={examState}
                setState={setExamState}
                onComplete={handleExamComplete}
                darkMode={darkMode}
                onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
              />
            )}
            {page === "results" && examState && (
              <Results
                state={examState}
                onRestart={() => {
                  setExamState(null);
                  setPage("home");
                }}
                darkMode={darkMode}
                onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <SubjectProvider>
      <PageContent />
    </SubjectProvider>
  );
}
