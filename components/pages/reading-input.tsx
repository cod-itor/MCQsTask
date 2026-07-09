"use client"

import { useState } from "react"
import { useSubjects } from "@/lib/subject-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReadingPassage, ReadingQuestion } from "@/lib/types"

interface ReadingInputProps {
  onReadingLoaded: () => void
  darkMode: boolean
}

export default function ReadingInput({ onReadingLoaded, darkMode }: ReadingInputProps) {
  const { subjects, activeSubjectId, addReadingPassagesToSubject } = useSubjects()
  const [input, setInput] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const currentSubject = subjects.find((s) => s.id === activeSubjectId)

  const exampleReading = [
    {
      header: "Reading passage one",
      content: "ACCIDENT INSURANCE FOR CITY MEDIA EMPLOYEES\n\nCity Media is pleased to offer its employees accident insurance benefits which are unique in the industry. Our insurance package not only insures employees against accidents occurring on the job, but extends to their off-hours. It also provides 24-hour protection to dependants and to eligible partners.",
      questions: [
        {
          id: "15",
          text: "The accident protection at City Media is [blank] amongst similar companies.",
          answer: "unique"
        },
        {
          id: "16",
          text: "The insurance programme excludes [blank] employees.",
          answer: "temporary",
          options: ["temporary", "contract", "permanent"]
        }
      ],
      globalOptions: ["unique", "temporary", "contract", "permanent", "common"]
    }
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
        setError("Input must be an array of Reading Passages")
        return
      }

      if (parsed.length === 0) {
        setError("Please provide at least one Reading Passage")
        return
      }

      const passages: ReadingPassage[] = parsed.map((item: any, index: number) => {
        if (!item.header || !item.content || !Array.isArray(item.questions)) {
          throw new Error(`Passage ${index + 1}: Missing required fields (header, content, questions array)`)
        }

        const questions: ReadingQuestion[] = item.questions.map((q: any, qIndex: number) => {
          if (!q.id || !q.text || !q.answer) {
             throw new Error(`Passage ${index + 1}, Question ${qIndex + 1}: Missing required fields (id, text, answer)`)
          }
          if (!q.text.includes("[blank]")) {
             throw new Error(`Passage ${index + 1}, Question ${qIndex + 1}: Question text must contain "[blank]" marker`)
          }
          return {
            id: String(q.id),
            text: q.text,
            answer: q.answer,
            options: q.options && Array.isArray(q.options) ? q.options : undefined
          }
        })

        return {
          id: `reading-${Date.now()}-${Math.random()}`,
          header: item.header,
          content: item.content,
          questions: questions,
          globalOptions: item.globalOptions && Array.isArray(item.globalOptions) ? item.globalOptions : undefined
        }
      })

      addReadingPassagesToSubject(activeSubjectId, passages)
      setSuccessMessage(`Added ${passages.length} Reading Passage(s) to "${currentSubject?.name}"`)
      setInput("")
      setTimeout(() => onReadingLoaded(), 1500)
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
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Load Reading Passages</h1>
          <p className={darkMode ? "text-slate-300" : "text-gray-600"}>Paste your Reading Passages in JSON format below</p>

          {activeSubjectId ? (
            <div
              className={`mt-4 p-3 rounded-lg ${
                darkMode
                  ? "bg-blue-900 border border-blue-700 text-blue-100"
                  : "bg-blue-50 border border-blue-200 text-blue-900"
              }`}
            >
              <p className="font-semibold">Adding passages to: {currentSubject?.name}</p>
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
              <CardTitle className="text-lg">Reading Format</CardTitle>
              <CardDescription className={darkMode ? "text-slate-400" : ""}>Required JSON structure</CardDescription>
            </CardHeader>
            <CardContent>
              <pre
                className={`p-3 rounded text-xs overflow-auto h-48 ${darkMode ? "bg-slate-900 text-slate-300" : "bg-gray-100 text-gray-800"}`}
              >
                {`[
  {
    "header": "Reading passage one",
    "content": "Full passage text...",
    "questions": [
      {
        "id": "1",
        "text": "The answer is [blank].",
        "answer": "A",
        "options": ["A", "B"]
      }
    ],
    "globalOptions": ["A. research", "B. purchases"]
  }
]`}
              </pre>
              <Button
                variant="outline"
                className={`w-full mt-4 ${darkMode ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600" : "bg-transparent"}`}
                onClick={() => {
                  setInput(JSON.stringify(exampleReading, null, 2))
                  setError("")
                  setSuccessMessage("")
                }}
              >
                Copy Example
              </Button>
            </CardContent>
          </Card>

          <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription className={darkMode ? "text-slate-400" : ""}>Important guidelines</CardDescription>
            </CardHeader>
            <CardContent className={`text-sm space-y-2 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
              <p>• header: string (required, title)</p>
              <p>• content: string (required, passage text)</p>
              <p>• globalOptions: array of strings (optional, renders global draggable options)</p>
              <p>• questions: array of questions</p>
              <p>• Question id: string (required, e.g. "15")</p>
              <p>• Question text: must contain "[blank]"</p>
              <p>• Question answer: correct answer string</p>
              <p>• Question options: array of strings (optional, renders dropdown)</p>
            </CardContent>
          </Card>
        </div>

        <Card className={darkMode ? "bg-slate-800 border-slate-700" : ""}>
          <CardHeader>
            <CardTitle>Paste your Reading Passages</CardTitle>
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
                Load Passages
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
