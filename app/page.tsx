"use client";

import { useState, useEffect } from "react";
import { SubjectProvider, useSubjects } from "@/lib/subject-context";
import Navbar from "@/components/navbar";
import HomeLanding from "@/components/pages/home-landing";
import MCQsPage from "@/components/pages/mcqs-page";
import PracticeTest from "@/components/pages/practice-test";
import ExamSetup from "@/components/pages/exam-setup";
import ExamTest from "@/components/pages/exam-test";
import Results from "@/components/pages/results";
import AboutUs from "@/components/pages/about-us";
import SubjectSidebar from "@/components/subject-sidebar";
import MobileSidebarDrawer from "@/components/mobile-sidebar-drawer";
import MCQInput from "@/components/pages/mcq-input";
import type { ExamState } from "@/lib/types";

function PageContent() {
  const { activeSubjectId, getMcqsForSubject } = useSubjects();
  const [page, setPage] = useState<
    | "home"
    | "input"
    | "practice"
    | "exam-setup"
    | "exam"
    | "results"
    | "mcqs"
    | "about"
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
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(true);
    }
    setTimeout(() => {
      if ((window as any).openCreateSubjectModal) {
        (window as any).openCreateSubjectModal();
      }
    }, 100);
  };

  const handleNavigate = (destination: "home" | "mcqs" | "about") => {
    if (destination === "home") {
      setPage("home");
    } else if (destination === "mcqs") {
      setPage("mcqs");
    } else if (destination === "about") {
      setPage("about");
    }
  };

  const showSidebar = [
    "practice",
    "exam-setup",
    "exam",
    "results",
    "mcqs",
  ].includes(page);

  return (
    <>
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
        onNavigate={handleNavigate}
        currentPage={
          page === "home"
            ? "home"
            : page === "about"
            ? "about"
            : page === "mcqs"
            ? "mcqs"
            : "home"
        }
      />

      <main className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div
          className={`min-h-screen transition-colors duration-300 ${
            darkMode ? "bg-gray-950" : "bg-gray-50"
          }`}
        >
          <div
            className="flex"
            style={{ height: "calc(100vh - 80px)", marginTop: "80px" }}
          >
            {/* Desktop Sidebar */}
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

            {/* Mobile Drawer */}
            <MobileSidebarDrawer
              isOpen={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              darkMode={darkMode}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              {page === "home" && (
                // <HomeLanding darkMode={darkMode} onNavigate={handleNavigate} /> // this for the button that changes this will invlude in V2.2
                <HomeLanding darkMode={darkMode} />
              )}
              {page === "mcqs" && (
                <MCQsPage
                  onStartPractice={handleStartPractice}
                  onStartExam={handleStartExamSetup}
                  onInputMcqs={() => setPage("input")}
                  darkMode={darkMode}
                  onCreateSubject={handleCreateSubject}
                  onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
                />
              )}
              {page === "about" && <AboutUs darkMode={darkMode} />}
              {page === "input" && (
                <MCQInput
                  onMcqsLoaded={() => setPage("mcqs")}
                  darkMode={darkMode}
                />
              )}
              {page === "practice" && (
                <PracticeTest
                  onBack={() => setPage("mcqs")}
                  darkMode={darkMode}
                  onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
                />
              )}
              {page === "exam-setup" && (
                <ExamSetup
                  onStart={handleStartExam}
                  onBack={() => setPage("mcqs")}
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
                    setPage("mcqs");
                  }}
                  darkMode={darkMode}
                  onOpenMobileSidebar={() => setMobileDrawerOpen(true)}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <SubjectProvider>
      <PageContent />
    </SubjectProvider>
  );
}
