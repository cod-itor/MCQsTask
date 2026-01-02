"use client"

import { useEffect, useState } from "react"
import { Hero } from "@/components/ui/hero"
import { Features } from "@/components/ui/feature"
import { LearningFlow } from "@/components/ui/learning-flow"
import { CTA } from "@/components/ui/cta"

export default function HomeLanding() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
  }, [])

  return (
    <main className="w-full overflow-hidden">
      <Hero darkMode={darkMode} />
      <Features darkMode={darkMode} />
      <LearningFlow darkMode={darkMode} />
      <CTA darkMode={darkMode} />
    </main>
  )
}
