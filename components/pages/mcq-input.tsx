"use client"

import { useState } from "react"
import { useSubjects } from "@/lib/subject-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MCQ } from "@/lib/types"

interface MCQInputProps {
  onMcqsLoaded: () => void
  darkMode: boolean
}

export default function MCQInput({ onMcqsLoaded, darkMode }: MCQInputProps) {
  const { subjects, activeSubjectId, setActiveSubject, addMcqsToSubject } = useSubjects()
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const currentSubject = subjects.find((s) => s.id === activeSubjectId)

  const exampleMCQ = [
    {
      q: "តើអាល់កាឡូអ៊ីតជាអ្វី?",
      opts: ["ជាជាតិស្ករសាមញ្ញ", "ជាបាPaïsos សរីរាង្គ", "ជាសារធាតុគីមីផលិតដោយមនុស្ស", "ជាបណ្តុំនៃប្រូតេអ៊ីន"],
      answer: 1,
      explanation: "អាល់កាឡូលឺងជាបាPaïsos សរីរាង្គដែលបង្កើតឡើងក្នុងដំណើរការស្ថេរភាពរលាយក្លូស",
    },
  ]

  const handleParse = () => {
    setError("")
    setSuccessMessage("")

    if (!activeSubjectId) {
      setError("Please select or create a subject first from the sidebar")
      return
    }

    try {
      const parsed = JSON.parse(input)

      if (!Array.isArray(parsed)) {
        setError("Input must be an array of MCQs")
        return
      }

      if (parsed.length === 0) {
        setError("Please provide at least one MCQ")
        return
      }

      const mcqs: MCQ[] = parsed.map((item: any, index: number) => {
        const question = item.q || item.question
        const options = item.opts || item.options
        const correctAnswer = item.answer !== undefined ? item.answer : item.correctAnswer

        if (!question || !options || correctAnswer === undefined) {
          throw new Error(`MCQ ${index + 1}: Missing required fields (q/question, opts/options, answer/correctAnswer)`)
        }
        if (!Array.isArray(options) || options.length < 2) {
          throw new Error(`MCQ ${index + 1}: Options must be an array with at least 2 items`)
        }
        if (correctAnswer < 0 || correctAnswer >= options.length) {
          throw new Error(`MCQ ${index + 1}: answer index out of range`)
        }

        return {
          id: `mcq-${Date.now()}-${Math.random()}`,
          q: question,
          opts: options,
          answer: correctAnswer,
          explanation: item.explanation || "",
        }
      })

      addMcqsToSubject(activeSubjectId, mcqs)
      setSuccessMessage(`Added ${mcqs.length} MCQ(s) to "${currentSubject?.name}"`)
      setInput("")
      setTimeout(() => onMcqsLoaded(), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    }
  }

  return (
    <div
      className={`min-h-screen p-4 py-12 transition-colors duration-300 ${
        darkMode ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-blue-50 to-indigo-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Load MCQs</h1>
          <p className={darkMode ? "text-slate-300" : "text-gray-600"}>Paste your MCQs in JSON format below</p>

          {activeSubjectId ? (
            <div
              className={`mt-4 p-3 rounded-lg ${
                darkMode
                  ? "bg-blue-900 border border-blue-700 text-blue-100"
                  : "bg-blue-50 border border-blue-200 text-blue-900"
              }`}
            >
              <p className="font-semibold">Adding questions to: {currentSubject?.name}</p>
            </div>
          ) : (
            <div
              className={`mt-4 p-3 rounded-lg ${
                darkMode
                  ? "bg-yellow-900 border border-yellow-700 text-yellow-100"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-900"
              }`}
            >
              <p className="font-semibold">Please select or create a subject from the sidebar first</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">MCQ Format</CardTitle>
              <CardDescription className={darkMode ? "text-slate-400" : ""}>Required JSON structure</CardDescription>
            </CardHeader>
            <CardContent>
              <pre
                className={`p-3 rounded text-xs overflow-auto ${darkMode ? "bg-slate-900 text-slate-300" : "bg-gray-100 text-gray-800"}`}
              >
                {`[
  {
    "q": "Question?",
    "opts": ["A", "B", "C"],
    "answer": 0,
    "explanation": "Optional"
  }
]`}
              </pre>
              <Button
                variant="outline"
                className={`w-full mt-4 ${darkMode ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600" : "bg-transparent"}`}
                onClick={() => {
                  setInput(JSON.stringify(exampleMCQ, null, 2))
                  setError("")
                  setSuccessMessage("")
                }}
              >
                Copy Khmer Example
              </Button>
            </CardContent>
          </Card>

          <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription className={darkMode ? "text-slate-400" : ""}>Important guidelines</CardDescription>
            </CardHeader>
            <CardContent className={`text-sm space-y-2 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
              <p>• q: string (question, required)</p>
              <p>• opts: array of strings (2+)</p>
              <p>• answer: index (0-based)</p>
              <p>• explanation: string (optional)</p>
              <p>• Valid JSON required</p>
            </CardContent>
          </Card>
        </div>

        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <CardHeader>
            <CardTitle>Paste your MCQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON array here..."
              className={`w-full h-96 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? "bg-slate-900 border-slate-600 text-slate-100 placeholder-slate-500" : "border-gray-300"
              }`}
            />
            {error && (
              <div
                className={`p-3 rounded ${
                  darkMode
                    ? "bg-red-900 border border-red-700 text-red-100"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {error}
              </div>
            )}
            {successMessage && (
              <div
                className={`p-3 rounded ${
                  darkMode
                    ? "bg-green-900 border border-green-700 text-green-100"
                    : "bg-green-50 border border-green-200 text-green-700"
                }`}
              >
                {successMessage}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleParse}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!input.trim() || !activeSubjectId}
              >
                Load MCQs
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInput("")
                  setError("")
                  setSuccessMessage("")
                }}
                className={darkMode ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600" : ""}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
