"use client"

import ReadingInput from "@/components/pages/reading-input"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function ReadingInputPage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleReadingLoaded = () => {
    router.push("/mcqs")
  }

  return (
    <ReadingInput
      onReadingLoaded={handleReadingLoaded}
      darkMode={darkMode}
    />
  )
}
