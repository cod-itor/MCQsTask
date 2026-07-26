"use client"

import ListeningInput from "@/components/pages/listening-input"
import { useRouter } from "next/navigation"
import { useDarkMode } from "@/lib/dark-mode-context"
import { useEffect } from "react"

export default function ListeningInputPage() {
  const router = useRouter()
  const { darkMode } = useDarkMode()

  const handleLoaded = () => {
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

  return (
    <ListeningInput 
      onLoaded={handleLoaded} 
      darkMode={darkMode} 
      onBack={handleBack}
    />
  )
}
