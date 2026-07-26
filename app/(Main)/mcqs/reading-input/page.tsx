"use client"

import ReadingInput from "@/components/pages/reading-input"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"
import { useEffect } from "react"

export default function ReadingInputPage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleReadingLoaded = () => {
    router.push("/mcqs")
  }

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).closeDesktopSidebar) {
      (window as any).closeDesktopSidebar();
    }
  }, []);

  return (
    <ReadingInput
      onReadingLoaded={handleReadingLoaded}
      darkMode={darkMode}
    />
  )
}
