"use client"

import AboutUs from "@/components/pages/about-us"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AboutUs />
    </motion.div>
  )
}
