"use client";

import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

interface HeroProps {
  darkMode?: boolean;
}

export function Hero({ darkMode = false }: HeroProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const floatingVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden px-4 py-20 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50"
      }`}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl ${
            darkMode ? "bg-blue-600/20" : "bg-blue-600/10"
          }`}
        />
        <div
          className={`absolute bottom-20 right-10 w-72 h-72 rounded-full blur-3xl ${
            darkMode ? "bg-purple-600/20" : "bg-purple-600/10"
          }`}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${
            darkMode
              ? "bg-blue-600/20 text-blue-400"
              : "bg-blue-600/10 text-blue-600"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Learning Made Smart</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={itemVariants}
          className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Practice MCQs{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smarter, Not Harder
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Create, manage, and practice multiple-choice questions in a focused,
          exam-ready environment. Built for students who want to learn
          efficiently.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="rounded-full px-6 py-2.5 font-medium bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            Start Practicing
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={`rounded-full px-6 py-2.5 font-medium ${
              darkMode
                ? "border-slate-700 hover:bg-slate-800 text-white"
                : "border-gray-300 hover:bg-gray-50 text-gray-900"
            }`}
          >
            Create MCQs
          </Button>
        </motion.div>

        {/* Floating element */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="mt-16 relative h-64 flex items-center justify-center"
        >
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full blur-2xl ${
                darkMode
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                  : "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
              }`}
            />
            <div
              className={`relative rounded-2xl p-8 shadow-lg backdrop-blur ${
                darkMode
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  1000+
                </div>
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Questions Ready to Learn
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
