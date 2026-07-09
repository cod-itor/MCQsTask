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

  const handleOpenMobileSidebar = () => {
    // Mobile sidebar is handled by parent layout
  }

  const handleCreateSubject = () => {
    if (window.innerWidth < 768) {
      // Mobile drawer will be triggered from navbar
    }
  }

  return (
    <MCQsPage
      onStartPractice={handleStartPractice}
      onStartExam={handleStartExam}
      onInputMcqs={handleInputMcqs}
      onStartReadingPractice={handleStartReadingPractice}
      onInputReading={handleInputReading}
      darkMode={darkMode}
      onCreateSubject={handleCreateSubject}
      onOpenMobileSidebar={handleOpenMobileSidebar}
    />
  )
}
