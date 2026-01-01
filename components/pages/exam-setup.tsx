"use client";

import { useState } from "react";
import { useSubjects } from "@/lib/subject-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExamSetupProps {
  onStart: (duration: number, numQuestions: number) => void;
  onBack: () => void;
  darkMode: boolean;
  onOpenMobileSidebar?: () => void;
}

const DURATION_OPTIONS = [5, 10, 15, 30, 45, 60, 90, 120, 180];

export default function ExamSetup({
  onStart,
  onBack,
  darkMode,
  onOpenMobileSidebar,
}: ExamSetupProps) {
  const { activeSubjectId, getMcqsForSubject, subjects } = useSubjects();
  const currentSubject = subjects.find((s) => s.id === activeSubjectId);
  const totalQuestions = getMcqsForSubject(activeSubjectId).length;

  const [duration, setDuration] = useState(30);
  const [numQuestions, setNumQuestions] = useState(
    Math.min(10, totalQuestions)
  );
  const [questionInput, setQuestionInput] = useState(
    String(Math.min(10, totalQuestions))
  );

  const [showDurationOptions, setShowDurationOptions] = useState(false);

  const handleStart = () => {
    if (duration > 0 && numQuestions > 0 && numQuestions <= totalQuestions) {
      onStart(duration, numQuestions);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="w-full max-w-md">
        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <CardHeader className={"text-center"}>
            <CardTitle className={`text-3xl ${darkMode ? "text-white" : ""}`}>
              Exam Setup
            </CardTitle>
            <CardDescription className={darkMode ? "text-slate-400" : ""}>
              {currentSubject?.name || "Configure your exam"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Subject Info */}
            <div
              className={`p-3 rounded-lg ${
                darkMode
                  ? "bg-slate-700 border border-slate-600"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-slate-100" : "text-gray-900"
                }`}
              >
                <strong>Subject:</strong>{" "}
                {currentSubject?.name || "No subject selected"}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                Available: {totalQuestions} questions
              </p>
            </div>

            {/* Duration */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-slate-100" : "text-gray-900"
                }`}
              >
                Exam Duration:
                <button
                  type="button"
                  onClick={() => setShowDurationOptions((v) => !v)}
                  className="ml-2 text-blue-600 font-semibold hover:underline"
                >
                  {duration} minutes
                </button>
              </label>

              {showDurationOptions && (
                <div
                  className={`mb-3 grid grid-cols-3 gap-2 rounded-lg p-3 border text-sm ${
                    darkMode
                      ? "bg-slate-800 border-slate-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {DURATION_OPTIONS.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setDuration(time);
                        setShowDurationOptions(false);
                      }}
                      className={`rounded-md px-2 py-1 font-medium transition ${
                        duration === time
                          ? "bg-blue-600 text-white"
                          : darkMode
                          ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {time} min
                    </button>
                  ))}
                </div>
              )}

              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />

              <div
                className={`flex justify-between text-xs mt-1 ${
                  darkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                <span>5 min</span>
                <span>180 min</span>
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-slate-100" : "text-gray-900"
                }`}
              >
                Number of Questions:
              </label>

              <div className="flex items-center gap-3 mb-3">
                <input
                  type="number"
                  min={1}
                  max={totalQuestions}
                  value={questionInput}
                  onChange={(e) => {
                    setQuestionInput(e.target.value);
                  }}
                  onBlur={() => {
                    let value = Number(questionInput);

                    if (!questionInput || Number.isNaN(value) || value < 1) {
                      value = 1;
                    } else if (value > totalQuestions) {
                      value = totalQuestions;
                    }

                    setNumQuestions(value);
                    setQuestionInput(String(value));
                  }}
                  className={`w-24 rounded-md border px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? "bg-slate-800 border-slate-600 text-slate-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />

                <span
                  className={`text-sm ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  of {totalQuestions}
                </span>
              </div>
            </div>

            {/* Info */}
            <div
              className={`p-4 rounded-lg border text-sm ${
                darkMode
                  ? "bg-slate-900 border-slate-600 text-slate-100"
                  : "bg-blue-50 border-blue-200 text-gray-700"
              }`}
            >
              <p>
                <strong>Time per question:</strong>{" "}
                {Math.round((duration * 60) / numQuestions)} seconds
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className={`flex-1 ${
                  darkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                    : "bg-transparent"
                }`}
              >
                Back
              </Button>

              {onOpenMobileSidebar && (
                <Button
                  variant="outline"
                  onClick={onOpenMobileSidebar}
                  className={
                    darkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
                      : "bg-transparent"
                  }
                >
                  Menu
                </Button>
              )}

              <Button
                onClick={handleStart}
                disabled={!activeSubjectId || totalQuestions === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Start Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
