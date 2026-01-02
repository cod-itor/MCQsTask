"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSubjects } from "@/lib/subject-context";
import ExamSetup from "@/components/pages/exam-setup";
import ExamTest from "@/components/pages/exam-test";
import type { ExamState } from "@/lib/types";

export default function ExamPage() {
  const router = useRouter();
  const { getMcqsForSubject, activeSubjectId } = useSubjects();
  const [examState, setExamState] = useState<ExamState | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  // Shuffle function using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartExam = (duration: number, numQuestions: number) => {
    const allMcqs = getMcqsForSubject(activeSubjectId);

    // Shuffle and select questions
    const shuffledMcqs = shuffleArray(allMcqs);
    const selectedMcqs = shuffledMcqs.slice(0, numQuestions);

    // Create shuffled options for each question
    const shuffledOptions: {
      [key: number]: { shuffled: string[]; mapping: number[] };
    } = {};

    selectedMcqs.forEach((question, qIndex) => {
      const indices = question.opts.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      shuffledOptions[qIndex] = {
        shuffled: shuffledIndices.map((i) => question.opts[i]),
        mapping: shuffledIndices,
      };
    });

    const newExamState: ExamState = {
      questions: selectedMcqs,
      currentQuestion: 0,
      answers: {},
      timeRemaining: duration * 60,
      isActive: true,
      sessionId: `exam-${Date.now()}`,
      startTime: Date.now(),
      questionStartTimes: {},
      shuffledOptions, // Include shuffled options from the start
    };

    setExamState(newExamState);
    sessionStorage.setItem("examState", JSON.stringify(newExamState));
    setShowSetup(false);
  };

  const handleExamComplete = () => {
    if (examState) {
      sessionStorage.setItem("examState", JSON.stringify(examState));
    }
    router.push("/mcqs/results");
  };

  const handleBack = () => {
    if (showSetup) {
      router.back();
    } else {
      setShowSetup(true);
      setExamState(null);
    }
  };

  const handleOpenMobileSidebar = () => {
    // Mobile sidebar is handled by parent layout
  };

  if (showSetup) {
    return (
      <ExamSetup
        onStart={handleStartExam}
        onBack={handleBack}
        darkMode={darkMode}
        onOpenMobileSidebar={handleOpenMobileSidebar}
      />
    );
  }

  if (examState) {
    return (
      <ExamTest
        state={examState}
        setState={setExamState}
        onComplete={handleExamComplete}
        onOpenMobileSidebar={handleOpenMobileSidebar}
      />
    );
  }

  return null;
}
