"use client"

import { useEffect, useState } from "react"
import MCQInput from "@/components/pages/mcq-input"
import { useRouter } from "next/navigation"

export default function InputPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
  }, [])

  const handleMcqsLoaded = () => {
    router.push("/mcqs")
  }

  return <MCQInput onMcqsLoaded={handleMcqsLoaded} darkMode={darkMode} />
}
