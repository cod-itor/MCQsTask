"use client"

import HomeLanding from "@/components/pages/home-landing"
import { useDarkMode } from "@/lib/dark-mode-context"
import { motion } from "framer-motion"

export default function HomePage() {
  const { darkMode } = useDarkMode()
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <HomeLanding darkMode={darkMode} />
    </motion.div>
  )
}
