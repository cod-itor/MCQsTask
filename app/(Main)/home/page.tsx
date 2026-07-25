"use client"

import HomeLanding from "@/components/pages/home-landing"
import { useDarkMode } from "@/lib/dark-mode-context"

export default function HomePage() {
  const { darkMode } = useDarkMode()
  return <HomeLanding darkMode={darkMode} />
}
