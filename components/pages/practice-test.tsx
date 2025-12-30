"use client"

import { useState } from "react"
import { useSubjects } from "@/lib/subject-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PracticeTestProps {
  onBack: () => void
  darkMode: boolean
  onOpenMobileSidebar?: () => void
}

export default function PracticeTest({ onBack, darkMode, onOpenMobileSidebar }: PracticeTestProps) {
  const { activeSubjectId, getMcqsForSubject, subjects } = useSubjects()
  const mcqs = getMcqsForSubject(activeSubjectId)
  const currentSubject = subjects.find((s) => s.id === activeSubjectId)

  const [displayQuestions, setDisplayQuestions] = useState(mcqs)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [shuffle, setShuffle] = useState(true)
  const [shuffleOptions, setShuffleOptions] = useState(true)
  const [retryMode, setRetryMode] = useState(false)

  const shuffleArray = (arr: string[]) => {
    return [...arr].sort(() => Math.random() - 0.5)
  }

  const handleShuffle = () => {
    setShuffle(!shuffle)
    setDisplayQuestions(shuffle ? mcqs : [...mcqs].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setAnswers({})
    setShowAnswer(false)
  }

  const handleShuffleOptions = () => {
    setShuffleOptions(!shuffleOptions)
  }

  const handleRetryIncorrect = () => {
    const incorrectQuestions = mcqs.filter((_, idx) => {
      const selected = answers[idx]
      return selected !== undefined && selected !== mcqs[idx].answer
    })

    if (incorrectQuestions.length === 0) {
      alert("No incorrect questions to retry!")
      return
    }

    setRetryMode(true)
    setDisplayQuestions(incorrectQuestions)
    setCurrentIndex(0)
    setAnswers({})
    setShowAnswer(false)
  }

  const handleExitRetry = () => {
    setRetryMode(false)
    setDisplayQuestions(mcqs)
    setCurrentIndex(0)
    setAnswers({})
    setShowAnswer(false)
  }

  const current = displayQuestions[currentIndex]
  const displayOptions = shuffleOptions ? shuffleArray(current.opts) : current.opts
  const selectedAnswer = answers[currentIndex]
  const isCorrect = selectedAnswer === current.answer

  const incorrectCount = Object.entries(answers).filter(([idx, selected]) => {
    const idxNum = Number.parseInt(idx)
    return selected !== displayQuestions[idxNum].answer
  }).length

  return (
    <div
      className={`min-h-screen p-4 py-8 transition-colors duration-300 ${
        darkMode ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {retryMode ? "Retry Incorrect Questions" : currentSubject?.name || "Practice Test"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {onOpenMobileSidebar && (
              <Button variant="outline" onClick={onOpenMobileSidebar}>
                Menu
              </Button>
            )}
          </div>
        </div>

        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-semibold ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                Question {currentIndex + 1} / {displayQuestions.length}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant={shuffle ? "default" : "outline"} onClick={handleShuffle} className="text-xs">
                  {shuffle ? "Shuffled" : "Ordered"}
                </Button>
                <Button
                  size="sm"
                  variant={shuffleOptions ? "default" : "outline"}
                  onClick={handleShuffleOptions}
                  className="text-xs"
                >
                  {shuffleOptions ? "Mixed" : "Original"}
                </Button>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                darkMode ? "bg-slate-900 border-slate-600 text-slate-100" : "bg-blue-50 border-blue-200"
              }`}
            >
              <h2 className={`text-lg font-semibold ${darkMode ? "text-slate-100" : "text-gray-900"}`}>{current.q}</h2>
            </div>

            <div className="space-y-3">
              {displayOptions.map((option, index) => {
                const optionIndex = current.opts.indexOf(option)
                const selected = selectedAnswer === optionIndex
                const isCorrectOption = optionIndex === current.answer

                let bgColor = darkMode
                  ? "bg-slate-700 hover:bg-slate-600 border-slate-600"
                  : "bg-white hover:bg-gray-50 border-gray-300"
                if (showAnswer) {
                  if (isCorrectOption)
                    bgColor = darkMode ? "bg-green-900 border-green-700" : "bg-green-50 border-green-500"
                  else if (selected && !isCorrect)
                    bgColor = darkMode ? "bg-red-900 border-red-700" : "bg-red-50 border-red-500"
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showAnswer && setAnswers({ ...answers, [currentIndex]: optionIndex })}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${bgColor} ${
                      selected
                        ? `border-2 ${darkMode ? "border-blue-500 bg-slate-600" : "border-blue-500 bg-blue-50"}`
                        : ""
                    }`}
                    disabled={showAnswer}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selected ? "bg-blue-500 border-blue-500" : darkMode ? "border-slate-500" : "border-gray-300"
                        }`}
                      >
                        {selected && <span className="text-white text-sm">✓</span>}
                      </div>
                      <span className={darkMode ? "text-slate-100" : "text-gray-900"}>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedAnswer !== undefined && !showAnswer && (
              <Button onClick={() => setShowAnswer(true)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Show Answer
              </Button>
            )}

            {showAnswer && (
              <>
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect
                      ? darkMode
                        ? "bg-green-900 border border-green-700 text-green-100"
                        : "bg-green-50 border border-green-200"
                      : darkMode
                        ? "bg-red-900 border border-red-700 text-red-100"
                        : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p
                    className={`font-semibold ${isCorrect ? (darkMode ? "text-green-100" : "text-green-900") : darkMode ? "text-red-100" : "text-red-900"}`}
                  >
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  <p className={`text-sm mt-1 ${darkMode ? "text-slate-200" : "text-gray-700"}`}>
                    Correct answer: <span className="font-semibold">{current.opts[current.answer]}</span>
                  </p>
                  {current.explanation && (
                    <p className={`text-sm mt-2 italic ${darkMode ? "text-slate-200" : "text-gray-700"}`}>
                      <strong>Explanation:</strong> {current.explanation}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex-1"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentIndex(Math.min(displayQuestions.length - 1, currentIndex + 1))}
                disabled={currentIndex === displayQuestions.length - 1}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentIndex(0)
                  setAnswers({})
                  setShowAnswer(false)
                  setDisplayQuestions(shuffle ? mcqs : [...mcqs].sort(() => Math.random() - 0.5))
                }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className={`text-center text-sm mb-4 ${darkMode ? "text-slate-400" : "text-gray-600"}`}>
          Answered: {Object.keys(answers).length} / {displayQuestions.length}
          {incorrectCount > 0 && (
            <span className={`block font-semibold mt-1 ${darkMode ? "text-orange-400" : "text-red-600"}`}>
              {incorrectCount} incorrect so far
            </span>
          )}
        </div>

        {Object.keys(answers).length === displayQuestions.length && (
          <div className="flex gap-3">
            {!retryMode && incorrectCount > 0 && (
              <Button onClick={handleRetryIncorrect} className="flex-1 bg-orange-600 hover:bg-orange-700">
                Retry Incorrect ({incorrectCount})
              </Button>
            )}
            {retryMode && (
              <Button
                onClick={handleExitRetry}
                className={`flex-1 ${darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-600 hover:bg-gray-700"}`}
              >
                Exit Retry Mode
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
