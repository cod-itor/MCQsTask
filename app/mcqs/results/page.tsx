"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Results from "@/components/pages/results"
import type { ExamState } from "@/lib/types"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function ResultsPage() {
  const router = useRouter()
  const [examState, setExamState] = useState<ExamState | null>(null)
  const { darkMode } = useDarkMode()

  useEffect(() => {
    const savedState = sessionStorage.getItem("examState")
    if (savedState) {
      setExamState(JSON.parse(savedState))
    }
  }, [])

  const handleRestart = () => {
    sessionStorage.removeItem("examState")
    router.push("/mcqs")
  }

  if (!examState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading results...</p>
      </div>
    )
  }

  return <Results state={examState} onRestart={handleRestart} darkMode={darkMode} onOpenMobileSidebar={() => {}} />
}
