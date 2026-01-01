"use client";

import { useEffect, useState } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ExamState } from "@/lib/types";

interface ExamTestProps {
  state: ExamState;
  setState: (state: ExamState) => void;
  onComplete: () => void;
  darkMode: boolean;
  onOpenMobileSidebar?: () => void;
}

// Shuffle function using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function ExamTest({
  state,
  setState,
  onComplete,
  darkMode,
  onOpenMobileSidebar,
}: ExamTestProps) {
  const { activeSubjectId, getMcqsForSubject, subjects } = useSubjects();
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<{
    [key: number]: { shuffled: string[]; mapping: number[] };
  }>({});

  // Hide navbar during exam
  useEffect(() => {
    // Add class to body and html to hide navbar
    document.body.classList.add("exam-mode");
    document.documentElement.classList.add("exam-mode");

    // Scroll to top to remove any offset
    window.scrollTo(0, 0);

    return () => {
      // Remove class when exam ends
      document.body.classList.remove("exam-mode");
      document.documentElement.classList.remove("exam-mode");
    };
  }, []);

  // Initialize shuffled options for all questions
  useEffect(() => {
    const initShuffled: {
      [key: number]: { shuffled: string[]; mapping: number[] };
    } = {};
    state.questions.forEach((question, qIndex) => {
      const indices = question.opts.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      initShuffled[qIndex] = {
        shuffled: shuffledIndices.map((i) => question.opts[i]),
        mapping: shuffledIndices,
      };
    });
    setShuffledOptions(initShuffled);
  }, [state.questions]);

  useEffect(() => {
    if (state.isActive) {
      localStorage.setItem("examState", JSON.stringify(state));
    }
  }, [state]);

  // Prevent navigation away from exam
  useEffect(() => {
    if (!state.isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "You have an active exam in progress. If you leave now, all your progress will be lost. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [state.isActive]);

  useEffect(() => {
    if (!state.isActive) return;

    const timer = setInterval(() => {
      setState({
        ...state,
        timeRemaining: state.timeRemaining - 1,
        isActive: state.timeRemaining - 1 > 0,
      });
    }, 1000);

    if (state.timeRemaining <= 0) {
      localStorage.removeItem("examState");
      onComplete();
    }

    if (state.timeRemaining === 300 && !showTimeWarning) {
      setShowTimeWarning(true);
    }

    return () => clearInterval(timer);
  }, [state, setState, onComplete, showTimeWarning]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Handle A-Z keys for option selection
      const key = e.key.toUpperCase();
      if (key >= "A" && key <= "Z") {
        const optionIndex = key.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
        const currentShuffled = shuffledOptions[state.currentQuestion];
        if (currentShuffled && optionIndex < currentShuffled.shuffled.length) {
          const originalIndex = currentShuffled.mapping[optionIndex];
          handleAnswer(originalIndex);
        }
      }
      if (e.key === "ArrowRight") {
        handleNext();
      }
      if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state, shuffledOptions]);

  const current = state.questions[state.currentQuestion];
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const selectedAnswer = state.answers[state.currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    setState({
      ...state,
      answers: { ...state.answers, [state.currentQuestion]: optionIndex },
    });
  };

  const handleNext = () => {
    if (state.currentQuestion < state.questions.length - 1) {
      setState({ ...state, currentQuestion: state.currentQuestion + 1 });
    }
  };

  const handlePrevious = () => {
    if (state.currentQuestion > 0) {
      setState({ ...state, currentQuestion: state.currentQuestion - 1 });
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleSubmit = () => {
    localStorage.removeItem("examState");
    onComplete();
  };

  const handleExitExam = () => {
    if (
      confirm(
        "Are you sure you want to leave the exam? Your progress will be lost."
      )
    ) {
      localStorage.removeItem("examState");
      onComplete();
    }
  };

  const handleEditMcqs = () => {
    alert(
      "Cannot edit MCQs during an active exam. Please exit the exam first."
    );
  };

  if (!current) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-blue-50 to-indigo-50"
        }`}
      >
        <p className={darkMode ? "text-slate-100" : "text-gray-900"}>
          Loading exam...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 overflow-y-auto transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="p-4 py-8">
        <div className="max-w-4xl mx-auto">
          {showTimeWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3
                      className={`text-2xl font-bold mb-4 ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      Time Warning
                    </h3>
                    <p
                      className={
                        darkMode ? "text-slate-100 mb-6" : "text-gray-700 mb-6"
                      }
                    >
                      You have only 5 minutes remaining!
                    </p>
                    <Button
                      onClick={() => setShowTimeWarning(false)}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Continue Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showExitConfirm && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3
                      className={`text-2xl font-bold mb-4 ${
                        darkMode ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      Leave Exam?
                    </h3>
                    <p
                      className={
                        darkMode ? "text-slate-100 mb-6" : "text-gray-700 mb-6"
                      }
                    >
                      Are you sure? Your progress will be lost.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowExitConfirm(false)}
                        className={`flex-1 ${
                          darkMode
                            ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                            : "bg-transparent"
                        }`}
                      >
                        Continue
                      </Button>
                      <Button
                        onClick={handleExitExam}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Leave
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Exam in Progress
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`text-3xl font-bold font-mono ${
                  state.timeRemaining <= 300
                    ? "text-red-600"
                    : darkMode
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowExitConfirm(true)}
                className="text-red-600"
              >
                Exit
              </Button>
            </div>
          </div>

          {/* Question Navigation Bar */}
          <Card
            className={darkMode ? "bg-slate-800 border-slate-700 mb-6" : "mb-6"}
          >
            <CardContent className="pt-4 pb-2">
              <div className="flex gap-2 flex-wrap">
                {state.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setState({ ...state, currentQuestion: index })
                    }
                    className={`w-10 h-10 rounded text-sm font-semibold transition-colors ${
                      index === state.currentQuestion
                        ? "bg-blue-600 text-white"
                        : state.answers[index] !== undefined
                        ? darkMode
                          ? "bg-green-900 text-green-100 border-2 border-green-700"
                          : "bg-green-100 text-green-800 border-2 border-green-300"
                        : darkMode
                        ? "bg-slate-700 text-slate-300"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card
            className={darkMode ? "bg-slate-800 border-slate-700 mb-6" : "mb-6"}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2
                  className={`text-lg font-semibold flex-1 ${
                    darkMode ? "text-slate-100" : "text-gray-900"
                  }`}
                >
                  {current.q}
                </h2>
                <span
                  className={`ml-4 text-sm font-semibold ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Q{state.currentQuestion + 1}/{state.questions.length}
                </span>
              </div>

              <div className="space-y-3">
                {shuffledOptions[state.currentQuestion]?.shuffled.map(
                  (option, displayIndex) => {
                    const originalIndex =
                      shuffledOptions[state.currentQuestion].mapping[
                        displayIndex
                      ];
                    const letterLabel = String.fromCharCode(65 + displayIndex); // A, B, C, D, etc.
                    return (
                      <button
                        key={displayIndex}
                        onClick={() => handleAnswer(originalIndex)}
                        className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                          selectedAnswer === originalIndex
                            ? `border-blue-500 ${
                                darkMode ? "bg-slate-700" : "bg-blue-50"
                              }`
                            : `${
                                darkMode
                                  ? "bg-slate-700 border-slate-600 hover:bg-slate-600"
                                  : "bg-white border-gray-300 hover:bg-gray-50"
                              }`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex-shrink-0 text-sm font-semibold px-2.5 py-1 rounded mt-0.5 ${
                              darkMode
                                ? "bg-slate-600 text-slate-300"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {letterLabel}
                          </span>
                          <span
                            className={`flex-1 break-words ${
                              darkMode ? "text-slate-100" : "text-gray-900"
                            }`}
                          >
                            {option}
                          </span>
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              selectedAnswer === originalIndex
                                ? "bg-blue-500 border-blue-500"
                                : darkMode
                                ? "border-slate-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedAnswer === originalIndex && (
                              <span className="text-white text-sm">✓</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-3 pt-4 border-t border-slate-600">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={state.currentQuestion === 0}
                  className={`flex-1 ${
                    darkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                      : "bg-transparent"
                  }`}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className={`flex-1 ${
                    darkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                      : "bg-transparent"
                  }`}
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={
                    state.currentQuestion === state.questions.length - 1
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
                {state.currentQuestion === state.questions.length - 1 && (
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Submit Exam
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div
            className={`text-center text-sm ${
              darkMode ? "text-slate-400" : "text-gray-600"
            }`}
          >
            Answered: {Object.keys(state.answers).length} /{" "}
            {state.questions.length}
            <p
              className={`text-xs mt-2 ${
                darkMode ? "text-slate-500" : "text-gray-500"
              }`}
            >
              Keyboard: A-Z to select | ← → to navigate
            </p>
            <p
              className={`text-md${
                darkMode ? "text-slate-500" : "text-gray-500"
              }`}
            >
              {" "}
              GOODLUCK!!!!!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
