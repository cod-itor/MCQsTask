"use client";

import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create or Import Questions",
    description:
      "Start by creating new MCQs or importing existing ones from your files.",
  },
  {
    number: "02",
    title: "Organize by Subject or Topic",
    description:
      "Categorize your questions for structured, focused learning sessions.",
  },
  {
    number: "03",
    title: "Practice in Exam Mode",
    description:
      "Take realistic practice tests with timed sessions and detailed feedback.",
  },
  {
    number: "04",
    title: "Improve & Master",
    description:
      "Review your progress, identify weak areas, and build confidence.",
  },
];

interface LearningFlowProps {
  darkMode?: boolean;
}

export function LearningFlow({ darkMode = false }: LearningFlowProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={ref}
      className={`w-full py-20 px-4 ${darkMode ? "bg-slate-900" : "bg-white"}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Your Learning Journey
          </h2>
          <p
            className={`text-lg max-w-2xl mx-auto ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Four simple steps to exam readiness
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className={`transition-colors ${
                  darkMode
                    ? "bg-gradient-to-r from-slate-800 to-slate-800/50 border-slate-700 hover:border-blue-600/50"
                    : "bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-blue-600/30"
                }`}
              >
                <div className="p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-blue-600/20" : "bg-blue-600/10"
                      }`}
                    >
                      <span className="text-2xl font-bold text-blue-600">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3
                      className={`text-2xl font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`leading-relaxed ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Checkmark */}
                  <div className="flex-shrink-0 hidden md:block">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        darkMode ? "bg-purple-600/20" : "bg-purple-600/10"
                      }`}
                    >
                      <Check className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { label: "Active Learners", value: "50K+" },
            { label: "Questions Created", value: "100K+" },
            { label: "Avg. Score Improvement", value: "35%" },
            { label: "Exam Success Rate", value: "92%" },
          ].map((stat, index) => (
            <Card
              key={index}
              className={`p-4 text-center ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stat.value}
              </div>
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {stat.label}
              </div>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
