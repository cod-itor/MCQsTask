"use client"

import { useEffect, useState } from "react"
import { Hero } from "@/components/ui/hero"
import { Features } from "@/components/ui/feature"
import { LearningFlow } from "@/components/ui/learning-flow"
import { CTA } from "@/components/ui/cta"

type HomeLandingProps = {
  darkMode?: boolean
}

export default function HomeLanding({ darkMode: darkModeProp }: HomeLandingProps) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (typeof darkModeProp === "boolean") {
      setDarkMode(darkModeProp)
      return
    }

    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
  }, [darkModeProp])

  return (
    <main className="w-full overflow-hidden">
      <Hero darkMode={darkMode} />
      <Features darkMode={darkMode} />
      <LearningFlow darkMode={darkMode} />
      <CTA darkMode={darkMode} />
    </main>
  )
}
