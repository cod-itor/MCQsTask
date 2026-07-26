"use client"

import MCQInput from "@/components/pages/mcq-input"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"
import { useEffect } from "react"

export default function InputPage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleMcqsLoaded = () => {
    router.push("/mcqs")
  }

  const handleBack = () => {
    router.push("/mcqs")
  }

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).closeDesktopSidebar) {
      (window as any).closeDesktopSidebar();
    }
  }, []);

  return <MCQInput onMcqsLoaded={handleMcqsLoaded} darkMode={darkMode} onBack={handleBack} />
}
