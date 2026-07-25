"use client"

import ListeningInput from "@/components/pages/listening-input"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function ListeningInputPage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleLoaded = () => {
    router.push("/mcqs")
  }

  const handleBack = () => {
    router.push("/mcqs")
  }

  return (
    <ListeningInput 
      onLoaded={handleLoaded} 
      darkMode={darkMode} 
      onBack={handleBack}
    />
  )
}
