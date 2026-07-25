"use client"

import ListeningPractice from "@/components/pages/listening-practice"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function ListeningPracticePage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleBack = () => {
    router.push("/mcqs")
  }

  const handleOpenMobileSidebar = () => {
    if (typeof window !== "undefined" && (window as any).openMobileSidebar) {
      (window as any).openMobileSidebar()
    }
  }

  return (
    <ListeningPractice 
      onBack={handleBack} 
      darkMode={darkMode}
      onOpenMobileSidebar={handleOpenMobileSidebar}
    />
  )
}
