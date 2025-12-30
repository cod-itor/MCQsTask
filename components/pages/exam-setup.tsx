"use client"

import { useState } from "react"
import { useSubjects } from "@/lib/subject-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ExamSetupProps {
  onStart: (duration: number, numQuestions: number) => void
  onBack: () => void
  darkMode: boolean
  onOpenMobileSidebar?: () => void
}

export default function ExamSetup({ onStart, onBack, darkMode, onOpenMobileSidebar }: ExamSetupProps) {
  const { activeSubjectId, getMcqsForSubject, subjects } = useSubjects()
  const currentSubject = subjects.find((s) => s.id === activeSubjectId)
  const totalQuestions = getMcqsForSubject(activeSubjectId).length

  const [duration, setDuration] = useState(30)
  const [numQuestions, setNumQuestions] = useState(Math.min(10, totalQuestions))

  const handleStart = () => {
    if (duration > 0 && numQuestions > 0 && numQuestions <= totalQuestions) {
      onStart(duration, numQuestions)
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        darkMode ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="w-full max-w-md">
        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <CardHeader
            className={`text-center ${darkMode ? "bg-slate-900" : "bg-gradient-to-r from-blue-50 to-indigo-50"}`}
          >
            <CardTitle className={`text-3xl ${darkMode ? "text-white" : ""}`}>Exam Setup</CardTitle>
            <CardDescription className={darkMode ? "text-slate-400" : ""}>
              {currentSubject?.name || "Configure your exam"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div
              className={`p-3 rounded-lg ${darkMode ? "bg-slate-700 border border-slate-600" : "bg-blue-50 border border-blue-200"}`}
            >
              <p className={`text-sm ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                <strong>Subject:</strong> {currentSubject?.name || "No subject selected"}
              </p>
              <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
                Available: {totalQuestions} questions
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-3 ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                Exam Duration: <span className="text-blue-600">{duration} minutes</span>
              </label>
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className={`flex justify-between text-xs mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                <span>5 min</span>
                <span>180 min</span>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-3 ${darkMode ? "text-slate-100" : "text-gray-900"}`}>
                Number of Questions: <span className="text-blue-600">{numQuestions}</span>
              </label>
              <input
                type="range"
                min="1"
                max={totalQuestions}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number.parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className={`flex justify-between text-xs mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                <span>1</span>
                <span>{totalQuestions}</span>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border text-sm ${
                darkMode ? "bg-slate-900 border-slate-600 text-slate-100" : "bg-blue-50 border-blue-200 text-gray-700"
              }`}
            >
              <p>
                <strong>Time per question:</strong> {Math.round((duration * 60) / numQuestions)} seconds
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className={`flex-1 ${darkMode ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600" : "bg-transparent"}`}
              >
                Back
              </Button>
              {onOpenMobileSidebar && (
                <Button
                  variant="outline"
                  onClick={onOpenMobileSidebar}
                  className={`${darkMode ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600" : "bg-transparent"}`}
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
  )
}
