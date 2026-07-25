"use client"

import ReadingPractice from "@/components/pages/reading-practice"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function ReadingPracticePage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleBack = () => {
    router.push("/mcqs")
  }

  const handleOpenMobileSidebar = () => {
    // Mobile sidebar is handled by parent layout
  }

  return (
    <ReadingPractice
      onBack={handleBack}
      darkMode={darkMode}
      onOpenMobileSidebar={handleOpenMobileSidebar}
    />
  )
}
