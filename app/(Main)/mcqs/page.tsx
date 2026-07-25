"use client"

import MCQsPage from "@/components/pages/mcqs-page"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function MCQsHub() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleStartPractice = () => {
    router.push("/mcqs/practice")
  }

  const handleStartExam = () => {
    router.push("/mcqs/exam")
  }

  const handleInputMcqs = () => {
    router.push("/mcqs/input")
  }

  const handleStartReadingPractice = () => {
    router.push("/mcqs/reading-practice")
  }

  const handleInputReading = () => {
    router.push("/mcqs/reading-input")
  }

  const handleStartListeningPractice = () => {
    router.push("/mcqs/listening-practice")
  }

  const handleInputListening = () => {
    router.push("/mcqs/listening-input")
  }

  const handleOpenMobileSidebar = () => {
    if (typeof window !== "undefined" && (window as any).openMobileSidebar) {
      (window as any).openMobileSidebar()
    }
  }

  const handleCreateSubject = () => {
    if (typeof window !== "undefined" && (window as any).openCreateSubjectModal) {
      (window as any).openCreateSubjectModal()
    }
  }

  return (
    <MCQsPage
      onStartPractice={handleStartPractice}
      onStartExam={handleStartExam}
      onInputMcqs={handleInputMcqs}
      onStartReadingPractice={handleStartReadingPractice}
      onInputReading={handleInputReading}
      onStartListeningPractice={handleStartListeningPractice}
      onInputListening={handleInputListening}
      darkMode={darkMode}
      onCreateSubject={handleCreateSubject}
      onOpenMobileSidebar={handleOpenMobileSidebar}
    />
  )
}
