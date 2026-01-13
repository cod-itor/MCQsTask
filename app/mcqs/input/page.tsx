"use client"

import MCQInput from "@/components/pages/mcq-input"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function InputPage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleMcqsLoaded = () => {
    router.push("/mcqs")
  }

  return <MCQInput onMcqsLoaded={handleMcqsLoaded} darkMode={darkMode} />
}
