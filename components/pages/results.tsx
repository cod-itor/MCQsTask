"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExamState } from "@/lib/types";

interface ResultsProps {
  state: ExamState;
  onRestart: () => void;
  darkMode: boolean;
  onOpenMobileSidebar?: () => void;
}

export default function Results({
  state,
  onRestart,
  darkMode,
  onOpenMobileSidebar,
}: ResultsProps) {
  const [reviewing, setReviewing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");

  const correct = state.questions.filter(
    (q, i) => state.answers[i] === q.answer
  ).length;
  const incorrect = state.questions.length - correct;
  const percentage = Math.round((correct / state.questions.length) * 100);

  const filteredQuestions = state.questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q, idx }) => {
      if (filter === "all") return true;
      if (filter === "correct") return state.answers[idx] === q.answer;
      if (filter === "incorrect") return state.answers[idx] !== q.answer;
      return true;
    });

  const mappedIndex = filteredQuestions[reviewIndex]?.idx || 0;
  const current = state.questions[mappedIndex];
  const userAnswer = state.answers[mappedIndex];
  const isCorrect = userAnswer === current.answer;

  const handleExport = () => {
    const exportData = {
      score: correct,
      total: state.questions.length,
      percentage: percentage,
      date: new Date().toLocaleString(),
      answers: state.questions.map((q, idx) => ({
        question: q.q,
        yourAnswer: q.opts[userAnswer],
        correctAnswer: q.opts[q.answer],
        correct: state.answers[idx] === q.answer,
      })),
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen p-4 py-8 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {!reviewing ? (
          <>
            <Card
              className={`mb-6 border-2 ${
                darkMode ? "bg-slate-800 border-slate-600" : "border-blue-200"
              }`}
            >
              <CardHeader
                className={`text-center 
                }`}
              >
                <CardTitle
                  className={`text-4xl ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Exam Results
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div
                    className={`text-center p-4 rounded-lg border ${
                      darkMode
                        ? "bg-green-900 border-green-700 text-green-100"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <div
                      className={`text-3xl font-bold ${
                        darkMode ? "text-green-300" : "text-green-600"
                      }`}
                    >
                      {correct}
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        darkMode ? "text-green-200" : "text-green-800"
                      }`}
                    >
                      Correct
                    </div>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg border ${
                      darkMode
                        ? "bg-red-900 border-red-700 text-red-100"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div
                      className={`text-3xl font-bold ${
                        darkMode ? "text-red-300" : "text-red-600"
                      }`}
                    >
                      {incorrect}
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        darkMode ? "text-red-200" : "text-red-800"
                      }`}
                    >
                      Incorrect
                    </div>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg border ${
                      darkMode
                        ? "bg-blue-900 border-blue-700 text-blue-100"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div
                      className={`text-3xl font-bold ${
                        darkMode ? "text-blue-300" : "text-blue-600"
                      }`}
                    >
                      {percentage}%
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        darkMode ? "text-blue-200" : "text-blue-800"
                      }`}
                    >
                      Score
                    </div>
                  </div>
                </div>

                <div
                  className={`w-full rounded-full h-4 mb-4 ${
                    darkMode ? "bg-slate-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-4 rounded-full ${
                      percentage >= 70
                        ? "bg-green-500"
                        : percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p
                  className={`text-center font-semibold mb-6 ${
                    darkMode ? "text-slate-100" : "text-gray-700"
                  }`}
                >
                  You answered {correct} out of {state.questions.length}{" "}
                  questions correctly
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setReviewing(true);
                      setReviewIndex(0);
                      setFilter("all");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Review Answers
                  </Button>
                  <Button
                    onClick={handleExport}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Export Results (JSON)
                  </Button>
                  {onOpenMobileSidebar && (
                    <Button
                      variant="outline"
                      onClick={onOpenMobileSidebar}
                      className={`w-full ${
                        darkMode
                          ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                          : "bg-transparent"
                      }`}
                    >
                      Change Subject
                    </Button>
                  )}
                  <Button
                    onClick={onRestart}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Return to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
              <h1
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Review Answers
              </h1>
              <div className="flex gap-2">
                {onOpenMobileSidebar && (
                  <Button
                    variant="outline"
                    onClick={onOpenMobileSidebar}
                    className="md:hidden bg-transparent"
                  >
                    Menu
                  </Button>
                )}
                <Button variant="outline" onClick={() => setReviewing(false)}>
                  Back
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => {
                  setFilter("all");
                  setReviewIndex(0);
                }}
                className={
                  filter === "all"
                    ? "bg-blue-600"
                    : darkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                    : "bg-transparent"
                }
              >
                All ({state.questions.length})
              </Button>
              <Button
                variant={filter === "correct" ? "default" : "outline"}
                onClick={() => {
                  setFilter("correct");
                  setReviewIndex(0);
                }}
                className={
                  filter === "correct"
                    ? "bg-green-600"
                    : darkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                    : "bg-transparent"
                }
              >
                Correct ({correct})
              </Button>
              <Button
                variant={filter === "incorrect" ? "default" : "outline"}
                onClick={() => {
                  setFilter("incorrect");
                  setReviewIndex(0);
                }}
                className={
                  filter === "incorrect"
                    ? "bg-red-600"
                    : darkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                    : "bg-transparent"
                }
              >
                Incorrect ({incorrect})
              </Button>
            </div>

            <Card
              className={
                darkMode ? "bg-slate-800 border-slate-700 mb-6" : "mb-6"
              }
            >
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2
                    className={`text-lg font-semibold ${
                      darkMode ? "text-slate-100" : "text-gray-900"
                    }`}
                  >
                    {current.q}
                  </h2>
                  <span
                    className={`text-sm font-semibold ${
                      darkMode ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    Q{reviewIndex + 1}/{filteredQuestions.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {current.opts.map((option, index) => {
                    const isCorrectOption = index === current.answer;
                    const isUserAnswer = index === userAnswer;

                    let bgColor = darkMode
                      ? "bg-slate-700 border-slate-600"
                      : "bg-white border-gray-300";
                    if (isCorrectOption) {
                      bgColor = darkMode
                        ? "bg-green-900 border-green-700"
                        : "bg-green-50 border-green-500";
                    } else if (isUserAnswer && !isCorrect) {
                      bgColor = darkMode
                        ? "bg-red-900 border-red-700"
                        : "bg-red-50 border-red-500";
                    }

                    return (
                      <div
                        key={index}
                        className={`w-full p-4 text-left border-2 rounded-lg ${bgColor}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              darkMode ? "text-slate-100" : "text-gray-900"
                            }
                          >
                            {option}
                          </span>
                          {isCorrectOption && (
                            <span
                              className={
                                darkMode
                                  ? "text-green-300 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              Correct
                            </span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span
                              className={
                                darkMode
                                  ? "text-red-300 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              Your answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {current.explanation && (
                  <div
                    className={`p-4 rounded ${
                      darkMode
                        ? "bg-blue-900 border border-blue-700 text-blue-100"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        darkMode ? "text-blue-100" : "text-blue-900"
                      }`}
                    >
                      <strong>Explanation:</strong> {current.explanation}
                    </p>
                  </div>
                )}

                {userAnswer !== undefined && !isCorrect && (
                  <div
                    className={`p-4 rounded ${
                      darkMode
                        ? "bg-yellow-900 border border-yellow-700 text-yellow-100"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        darkMode ? "text-yellow-100" : "text-yellow-900"
                      }`}
                    >
                      <strong>Your answer:</strong> {current.opts[userAnswer]}
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        darkMode ? "text-yellow-100" : "text-yellow-900"
                      }`}
                    >
                      <strong>Correct answer:</strong>{" "}
                      {current.opts[current.answer]}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                    disabled={reviewIndex === 0}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() =>
                      setReviewIndex(
                        Math.min(filteredQuestions.length - 1, reviewIndex + 1)
                      )
                    }
                    disabled={reviewIndex === filteredQuestions.length - 1}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setReviewing(false)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Back to Results
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
